import { Observable } from '../Observable';
import { coldObservable } from './ColdObservable';
import { HotObservable, hotObservable } from './HotObservable';
import { Subscription } from '../Subscription';
import { createVirtualScheduler, VirtualScheduler} from '../scheduler/virtualScheduler';
import { Notification, SchedulerLike, FOType, Sink } from '../types';
import { isObservable } from '../util/isObservable';


export interface SubscriptionLog {
  subscribedFrame: number;
  unsubscribedFrame: number;
}

export interface TestMessage<T> {
  frame: number;
  notification: Notification<T>;
  isGhost?: boolean;
}

const DEFAULT_MAX_FRAME = 750;
const FRAME_TIME_FACTOR = 1;

export interface RunHelpers {
  cold<T = string>(marbles: string, values?: { [marble: string]: T }, error?: any): TestObservable<T>;
  hot<T = string>(marbles: string, values?: { [marble: string]: T }, error?: any): HotObservable<T>;
  flush(): void;
  expectObservable(observable: Observable<any>, unsubscriptionMarbles?: string): ({ toBe: observableToBeFn });
  expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]): ({ toBe: subscriptionLogsToBeFn });
}

interface FlushableTest {
  ready: boolean;
  actual?: any[];
  expected?: any[];
}

export interface TestObservable<T> extends Observable<T> {
  subscriptions: SubscriptionLog[];
  messages: TestMessage<T>[];
}

export type observableToBeFn = (marbles: string, values?: any, errorValue?: any) => void;
export type subscriptionLogsToBeFn = (marbles: string | string[]) => void;

export interface TestScheduler extends VirtualScheduler {
  readonly hotObservables: HotObservable<any>[];
  readonly coldObservables: TestObservable<any>[];

  createTime(marbles: string): number;
  createColdObservable<T = string>(marbles: string, values?: { [marble: string]: T }, error?: any): TestObservable<T>;
  createHotObservable<T = string>(marbles: string, values?: { [marble: string]: T }, error?: any): HotObservable<T>;

  expectObservable(observable: Observable<any>, unsubscriptionMarbles?: string): ({ toBe: observableToBeFn });
  expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]): ({ toBe: subscriptionLogsToBeFn });

  run<T>(callback: (helpers: RunHelpers) => T): T;
}

export function subscriptionLogger() {
  return {
    logSubscription(frame: number): number {
      const { logs } = this;
      logs.push(subscriptionLog(frame));
      return logs.length - 1;
    },
    logUnsubscription(index: number, frame: number) {
      this.logs[index].unsubscribedFrame = frame;
    },
    logs: [] as SubscriptionLog[],
  };
}

export function subscriptionLog(subscribedFrame: number, unsubscribedFrame = Number.POSITIVE_INFINITY): SubscriptionLog {
  return {
    subscribedFrame,
    unsubscribedFrame,
  };
}

export function createTestScheduler(assertDeepEqual: (actual: any, expected: any) => boolean | void): TestScheduler {
  const coldObservables: TestObservable<any>[] = [];
  const hotObservables: HotObservable<any>[] = [];

  const virtualScheduler = createVirtualScheduler();

  let runMode = false;

  let flushTests: FlushableTest[] = [];

  function _materializeInnerObservable(observable: Observable<any>,
    outerFrame: number, scheduler: VirtualScheduler): TestMessage<any>[] {
      const messages: TestMessage<any>[] = [];
      observable.subscribe((value) => {
        messages.push({ frame: scheduler.frame - outerFrame, notification: { kind: 'N', value } });
      }, (error) => {
        messages.push({ frame: scheduler.frame - outerFrame, notification: { kind: 'E', error } });
      }, () => {
        messages.push({ frame: scheduler.frame - outerFrame, notification: { kind: 'C' } });
      });
      return messages;
    }

  return {
    hotObservables,
    coldObservables,
    frame: 0,
    index: -1,
    frameTimeFactor: FRAME_TIME_FACTOR,
    maxFrames: 750, // TODO: Change this? It's the old default. Maybe remove it.

    now() {
      return virtualScheduler.now();
    },

    schedule(...args: any[]) {
      return (virtualScheduler as any).schedule(...args);
    },

    createTime(marbles: string): number {
      const indexOf: number = marbles.indexOf('|');
      if (indexOf === -1) {
        throw new Error('marble diagram for time should have a completion marker "|"');
      }
      return indexOf * this.frameTimeFactor;
    },

    /**
     * @param marbles A diagram in the marble DSL. Letters map to keys in `values` if provided.
     * @param values Values to use for the letters in `marbles`. If ommitted, the letters themselves are used.
     * @param error The error to use for the `#` marble (if present).
     */
    createColdObservable<T = string>(marbles: string, values?: { [marble: string]: T }, error?: any): TestObservable<T> {
      if (marbles.indexOf('^') !== -1) {
        throw new Error('cold observable cannot have subscription offset "^"');
      }
      if (marbles.indexOf('!') !== -1) {
        throw new Error('cold observable cannot have unsubscription marker "!"');
      }
      const messages = parseMarbles(marbles, values, error, undefined, runMode);
      const cold = coldObservable<T>(messages, this);
      this.coldObservables.push(cold);
      return cold;
    },

    /**
     * @param marbles A diagram in the marble DSL. Letters map to keys in `values` if provided.
     * @param values Values to use for the letters in `marbles`. If ommitted, the letters themselves are used.
     * @param error The error to use for the `#` marble (if present).
     */
    createHotObservable<T = string>(marbles: string, values?: { [marble: string]: T }, error?: any): HotObservable<T> {
      if (marbles.indexOf('!') !== -1) {
        throw new Error('hot observable cannot have unsubscription marker "!"');
      }
      const messages = parseMarbles(marbles, values, error, undefined, runMode);
      const subject = hotObservable<T>(messages, this);
      this.hotObservables.push(subject);
      return subject;
    },

    expectObservable(observable: Observable<any>,
                   unsubscriptionMarbles: string = null): ({ toBe: observableToBeFn }) {
      const actual: TestMessage<any>[] = [];
      const flushTest: FlushableTest = { actual, ready: false };
      const unsubscriptionFrame = parseMarblesAsSubscriptions(unsubscriptionMarbles, runMode).unsubscribedFrame;
      let subscription: Subscription;

      this.schedule(() => {
        subscription = observable.subscribe(x => {
          let value = x;
          // Support Observable-of-Observables
          if (x instanceof Observable) {
            value = _materializeInnerObservable(value, this.frame, this);
          }
          actual.push({ frame: this.frame, notification: { kind: 'N', value } });
        }, (error) => {
          actual.push({ frame: this.frame, notification: { kind: 'E', error } });
        }, () => {
          actual.push({ frame: this.frame, notification: { kind: 'C' } });
        });
      }, 0);

      if (unsubscriptionFrame !== Number.POSITIVE_INFINITY) {
        this.schedule(() => subscription.unsubscribe(), unsubscriptionFrame);
      }

      flushTests.push(flushTest);

      return {
        toBe(marbles: string, values?: any, errorValue?: any) {
          flushTest.ready = true;
          flushTest.expected = parseMarbles(marbles, values, errorValue, true, runMode);
        }
      };
    },

    expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]): ({ toBe: subscriptionLogsToBeFn }) {
      const flushTest: FlushableTest = { actual: actualSubscriptionLogs, ready: false };
      flushTests.push(flushTest);
      return {
        toBe(marbles: string | string[]) {
          const marblesArray: string[] = (typeof marbles === 'string') ? [marbles] : marbles;
          flushTest.ready = true;
          flushTest.expected = marblesArray.map(marbles =>
            parseMarblesAsSubscriptions(marbles, runMode)
          );
        }
      };
    },

    run<T>(callback: (helpers: RunHelpers) => T): T {
      const prevFrameTimeFactor = this.frameTimeFactor;
      const prevMaxFrames = this.maxFrames;

      // TestScheduler.FRAME_TIME_FACTOR = 1;
      this.maxFrames = Number.POSITIVE_INFINITY;
      runMode = true;
      // TODO: Monkey patch all schedulers.
      // AsyncScheduler.delegate = this;

      const helpers = {
        cold: this.createColdObservable.bind(this),
        hot: this.createHotObservable.bind(this),
        flush: this.flush.bind(this),
        expectObservable: this.expectObservable.bind(this),
        expectSubscriptions: this.expectSubscriptions.bind(this),
      };
      try {
        const ret = callback(helpers);
        this.flush();
        return ret;
      } finally {
        // TestScheduler.FRAME_TIME_FACTOR = prevFrameTimeFactor;
        this.maxFrames = prevMaxFrames;
        runMode = false;
        // TODO: Unpatch all schedulers
        // AsyncScheduler.delegate = undefined;
      }
    },

    flush(): void {
      const hotObservables = this.hotObservables;
      while (hotObservables.length > 0) {
        hotObservables.shift().setup();
      }

      virtualScheduler.flush();

      flushTests = flushTests.filter(test => {
        if (test.ready) {
          assertDeepEqual(test.actual, test.expected);
          return false;
        }
        return true;
      });
    }
  };
}


function parseMarblesAsSubscriptions(marbles: string, runMode = false): SubscriptionLog {
  if (typeof marbles !== 'string') {
    return subscriptionLog(Number.POSITIVE_INFINITY);
  }

  const len = marbles.length;
  let groupStart = -1;
  let subscriptionFrame = Number.POSITIVE_INFINITY;
  let unsubscriptionFrame = Number.POSITIVE_INFINITY;
  let frame = 0;

  for (let i = 0; i < len; i++) {
    let nextFrame = frame;
    const advanceFrameBy = (count: number) => {
      nextFrame += count * FRAME_TIME_FACTOR;
    };
    const c = marbles[i];
    switch (c) {
      case ' ':
        // Whitespace no longer advances time
        if (!runMode) {
          advanceFrameBy(1);
        }
        break;
      case '-':
        advanceFrameBy(1);
        break;
      case '(':
        groupStart = frame;
        advanceFrameBy(1);
        break;
      case ')':
        groupStart = -1;
        advanceFrameBy(1);
        break;
      case '^':
        if (subscriptionFrame !== Number.POSITIVE_INFINITY) {
          throw new Error('found a second subscription point \'^\' in a ' +
            'subscription marble diagram. There can only be one.');
        }
        subscriptionFrame = groupStart > -1 ? groupStart : frame;
        advanceFrameBy(1);
        break;
      case '!':
        if (unsubscriptionFrame !== Number.POSITIVE_INFINITY) {
          throw new Error('found a second subscription point \'^\' in a ' +
            'subscription marble diagram. There can only be one.');
        }
        unsubscriptionFrame = groupStart > -1 ? groupStart : frame;
        break;
      default:
        // time progression syntax
        if (runMode && c.match(/^[0-9]$/)) {
          // Time progression must be preceeded by at least one space
          // if it's not at the beginning of the diagram
          if (i === 0 || marbles[i - 1] === ' ') {
            const buffer = marbles.slice(i);
            const match = buffer.match(/^([0-9]+(?:\.[0-9]+)?)(ms|s|m) /);
            if (match) {
              i += match[0].length - 1;
              // tslint:disable-next-line:ban
              const duration = parseFloat(match[1]);
              const unit = match[2];
              let durationInMs: number;

              switch (unit) {
                case 'ms':
                  durationInMs = duration;
                  break;
                case 's':
                  durationInMs = duration * 1000;
                  break;
                case 'm':
                  durationInMs = duration * 1000 * 60;
                  break;
                default:
                  break;
              }

              advanceFrameBy(durationInMs / FRAME_TIME_FACTOR);
              break;
            }
          }
        }

        throw new Error('there can only be \'^\' and \'!\' markers in a ' +
          'subscription marble diagram. Found instead \'' + c + '\'.');
    }

    frame = nextFrame;
  }

  if (unsubscriptionFrame < 0) {
    return subscriptionLog(subscriptionFrame);
  } else {
    return subscriptionLog(subscriptionFrame, unsubscriptionFrame);
  }
}

function isTestObservable(value: any): value is TestObservable<any> {
  return isObservable(value) && Array.isArray((value as any).subscriptions);
}

function parseMarbles<T=string>(marbles: string,
                      values?: { [key: string]: T },
                      errorValue?: any,
                      materializeInnerObservables = false,
                      runMode = false): TestMessage<T>[] {
    if (marbles.indexOf('!') !== -1) {
      throw new Error('conventional marble diagrams cannot have the ' +
        'unsubscription marker "!"');
    }
    const len = marbles.length;
    const testMessages: TestMessage<T>[] = [];
    const subIndex = runMode ? marbles.replace(/^[ ]+/, '').indexOf('^') : marbles.indexOf('^');
    let frame = subIndex === -1 ? 0 : (subIndex * - FRAME_TIME_FACTOR);
    const getValue = typeof values !== 'object' ?
      (x: any) => x :
      (x: any) => {
        // Support Observable-of-Observables
        const value = values[x];
        if (materializeInnerObservables && isTestObservable(value)) {
          return value.messages;
        }
        return value;
      };
    let groupStart = -1;

    for (let i = 0; i < len; i++) {
      let nextFrame = frame;
      const advanceFrameBy = (count: number) => {
        nextFrame += count * FRAME_TIME_FACTOR;
      };

      let notification: Notification<any>;
      const c = marbles[i];
      switch (c) {
        case ' ':
          // Whitespace no longer advances time
          if (!runMode) {
            advanceFrameBy(1);
          }
          break;
        case '-':
          advanceFrameBy(1);
          break;
        case '(':
          groupStart = frame;
          advanceFrameBy(1);
          break;
        case ')':
          groupStart = -1;
          advanceFrameBy(1);
          break;
        case '|':
          notification = { kind: 'C' };
          advanceFrameBy(1);
          break;
        case '^':
          advanceFrameBy(1);
          break;
        case '#':
          notification = { kind: 'E', error: errorValue || 'error' };
          advanceFrameBy(1);
          break;
        default:
          // Might be time progression syntax, or a value literal
          if (runMode && c.match(/^[0-9]$/)) {
            // Time progression must be preceeded by at least one space
            // if it's not at the beginning of the diagram
            if (i === 0 || marbles[i - 1] === ' ') {
              const buffer = marbles.slice(i);
              const match = buffer.match(/^([0-9]+(?:\.[0-9]+)?)(ms|s|m) /);
              if (match) {
                i += match[0].length - 1;
                const duration = parseFloat(match[1]);
                const unit = match[2];
                let durationInMs: number;

                switch (unit) {
                  case 'ms':
                    durationInMs = duration;
                    break;
                  case 's':
                    durationInMs = duration * 1000;
                    break;
                  case 'm':
                    durationInMs = duration * 1000 * 60;
                    break;
                  default:
                    break;
                }

                advanceFrameBy(durationInMs / FRAME_TIME_FACTOR);
                break;
              }
            }
          }

          notification = { kind: 'N', value: getValue(c) };
          advanceFrameBy(1);
          break;
      }

      if (notification) {
        testMessages.push({ frame: groupStart > -1 ? groupStart : frame, notification });
      }

      frame = nextFrame;
    }
    return testMessages;
  }

  export function scheduleNotifications(scheduler: SchedulerLike, messages: TestMessage<any>[], subject: Sink<any>, subs: Subscription) {
    scheduler.schedule(() => {
      for (const message of messages) {
        let t: FOType;
        let a: any = undefined;
        const { notification, frame } = message;
        if (notification.kind === 'N') {
          t = FOType.NEXT;
          a = notification.value;
        } else if (notification.kind === 'E') {
          t = FOType.ERROR;
          a = notification.error;
        } else if (notification.kind === 'C') {
          t = FOType.COMPLETE;
        } else {
          continue;
        }
        scheduler.schedule(({ t, a, subs }) => subject(t, a, subs), frame, { t, a, subs });
      }
    });
  }
