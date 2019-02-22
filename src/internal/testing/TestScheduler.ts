import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { VirtualTimeScheduler} from 'rxjs/internal/scheduler/VirtualTimeScheduler';
import { isObservable } from 'rxjs/internal/util/isObservable';
import { Subject } from '../Subject';
import { Notification } from '../Notification';
import { Subscriber } from 'rxjs';
import { __rx_scheduler_overrides__ } from '../scheduler/common';

/**
 * Used for extending what the TestScheduler is patching.
 */
export interface SchedulerPatch {
  patch: (testScheduler: TestScheduler) => void;
  unpatch: () => void;
  [key: string]: any;
}

export interface SubscriptionLog {
  subscribedFrame: number;
  unsubscribedFrame: number;
}

export interface TestMessage<T> {
  frame: number;
  notification: Notification<T>;
  isGhost?: boolean;
}

const FRAME_TIME_FACTOR = 1;

export interface RunHelpers {
  cold<T = string>(marbles: string, values?: { [marble: string]: T }, error?: any): TestObservable<T>;
  hot<T = string>(marbles: string, values?: { [marble: string]: T }, error?: any): HotObservable<T>;
  time(marbles: string): number;
  flush(): void;
  expectObservable(observable: Observable<any>, unsubscriptionMarbles?: string): ({ toBe: observableToBeFn });
  expectSubscriptionsTo(observable: TestObservable<any>): ({ toBe: subscriptionLogsToBeFn });
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

export class TestScheduler extends VirtualTimeScheduler {
  private _runMode = false;
  private _flushTests: FlushableTest[] = [];
  // private _patches = DEFAULT_SCHEDULER_PATCHES;

  protected _hotObservables: HotObservable<any>[] = [];
  protected _coldObservables: TestObservable<any>[] = [];

  constructor(private _assertDeepEqual: (actual: any, expected: any) => boolean | void) {
    super();
  }

  _materializeInnerObservable(
    observable: Observable<any>,
    outerFrame: number
  ): TestMessage<any>[] {
    const messages: TestMessage<any>[] = [];
    observable.subscribe({
      next: (value) => {
        messages.push({ frame: this.frame - outerFrame, notification: Notification.createNext(value) });
      },
      error: (error) => {
        messages.push({ frame: this.frame - outerFrame, notification: Notification.createError(error) });
      },
      complete: () => {
        messages.push({ frame: this.frame - outerFrame, notification: Notification.createComplete() });
      }
    });
    return messages;
  }

  createTime(marbles: string): number {
    const indexOf: number = marbles.indexOf('|');
    if (indexOf === -1) {
      throw new Error('marble diagram for time should have a completion marker "|"');
    }
    return indexOf * this.frameTimeFactor;
  }

  createColdObservable<T = string>(marbles: string, values?: { [marble: string]: T }, error?: any): TestObservable<T> {
  if (marbles.indexOf('^') !== -1) {
    throw new Error('cold observable cannot have subscription offset "^"');
  }
  if (marbles.indexOf('!') !== -1) {
    throw new Error('cold observable cannot have unsubscription marker "!"');
  }
  const messages = parseMarbles(marbles, values, error, undefined, this._runMode);
  const cold = new ColdObservable(messages, this as TestScheduler);
  this._coldObservables.push(cold);
  return cold;
  }

  createHotObservable<T = string>(marbles: string, values?: { [marble: string]: T }, error?: any): HotObservable<T> {
    if (marbles.indexOf('!') !== -1) {
      throw new Error('hot observable cannot have unsubscription marker "!"');
    }
    const messages = parseMarbles(marbles, values, error, undefined, this._runMode);
    const subject = new HotObservable(messages, this as TestScheduler);
    this._hotObservables.push(subject);
    return subject;
  }

  expectObservable(
    observable: Observable<any>,
    subscriptionMarbles: string = null
  ): ({ toBe: observableToBeFn }) {
    const actual: TestMessage<any>[] = [];
    const flushTest: FlushableTest = { actual, ready: false };
    const subscriptionParsed = parseMarblesAsSubscriptions(subscriptionMarbles, this._runMode);
    const subscriptionFrame = subscriptionParsed.subscribedFrame === Number.POSITIVE_INFINITY ?
      0 : subscriptionParsed.subscribedFrame;
  const unsubscriptionFrame = subscriptionParsed.unsubscribedFrame;
    let subscription: Subscription;

    this.schedule(() => {
      subscription = observable.subscribe({
        next: x => {
          let value = x;
          // Support Observable-of-Observables
          if (isObservable(x)) {
            value = this._materializeInnerObservable(x, this.frame);
          }
          actual.push({ frame: this.frame, notification: Notification.createNext(value) });
        },
        error: (error) => {
          actual.push({ frame: this.frame, notification: Notification.createError(error) });
        },
        complete: () => {
          actual.push({ frame: this.frame, notification: Notification.createComplete() });
        }
      });
    }, subscriptionFrame);

    if (unsubscriptionFrame !== Number.POSITIVE_INFINITY) {
      this.schedule(() => subscription.unsubscribe(), unsubscriptionFrame);
    }

    this._flushTests.push(flushTest);

    return {
      toBe: (marbles: string, values?: any, errorValue?: any) => {
        flushTest.ready = true;
        flushTest.expected = parseMarbles(marbles, values, errorValue, true, this._runMode);
      }
    };
  }

  /** @deprecated Use {@link TestScheduler.prototype.expectSubscriptionsTo} instead. */
  expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]): ({ toBe: subscriptionLogsToBeFn }) {
    const flushTest: FlushableTest = { actual: actualSubscriptionLogs, ready: false };
    this._flushTests.push(flushTest);
    const { _runMode } = this;
    return {
      toBe(marbles: string | string[]) {
        const marblesArray: string[] = (typeof marbles === 'string') ? [marbles] : marbles;
        flushTest.ready = true;
        flushTest.expected = marblesArray.map(marbles =>
          parseMarblesAsSubscriptions(marbles, _runMode)
        );
      }
    };
  }

  expectSubscriptionsTo(observable: TestObservable<any>): ({ toBe: subscriptionLogsToBeFn }) {
    const actual: any[] = [];
    const flushTest: FlushableTest = { actual, ready: false };

    this.schedule(() => {
      observable.subscriptions.map(log => {
        actual.push(log);
      });
    }, 0);

    return {
      toBe: (marbles: string | string[]) => {
        const marblesArray: string[] = (typeof marbles === 'string') ? [marbles] : marbles;
        flushTest.ready = true;
        flushTest.expected = marblesArray.map(marbles =>
          parseMarblesAsSubscriptions(marbles, this._runMode)
        );
      }
    };
  }

  run<T>(callback: (helpers: RunHelpers) => T): T {
    const prevMaxFrames = this.maxFrames;
    this.maxFrames = Number.POSITIVE_INFINITY;
    this._runMode = true;

    // const patches: SchedulerPatch[] = this._patches;

    // // Patch the schedulers
    // patches.forEach(patch => patch.patch(this));

    __rx_scheduler_overrides__.scheduler = this;

    const helpers = {
      cold: this.createColdObservable.bind(this),
      hot: this.createHotObservable.bind(this),
      flush: this.flush.bind(this),
      expectObservable: this.expectObservable.bind(this),
      expectSubscriptionsTo: this.expectSubscriptionsTo.bind(this),
      time: this.createTime.bind(this),
    };
    try {
      const ret = callback(helpers);

      this.flush();
      return ret;
    } finally {
      __rx_scheduler_overrides__.scheduler = null;
      this.maxFrames = prevMaxFrames;
      this._runMode = false;
      // Unpatch the schedulers
      // patches.forEach(patch => patch.unpatch());
    }
  }

  flush(): void {
    const hotObservables = this._hotObservables;
    while (hotObservables.length > 0) {
      hotObservables.shift().setup();
    }

    super.flush();

    this._flushTests = this._flushTests.filter((test: any) => {
      if (test.ready) {
        this._assertDeepEqual(test.actual, test.expected);
        return false;
      }
      return true;
    });
  }
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

export function parseMarblesAsSubscriptions(marbles: string, runMode = false): SubscriptionLog {
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

export function parseMarbles<T = string>(
  marbles: string,
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
  const getValue = !values ?
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
        notification = Notification.createComplete();
        advanceFrameBy(1);
        break;
      case '^':
        advanceFrameBy(1);
        break;
      case '#':
        notification = Notification.createError(errorValue || 'error');
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

        notification = Notification.createNext(getValue(c));
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

class HotObservable<T> extends Subject<T> implements TestObservable<T> {
  private _subscriptionLogger = subscriptionLogger();

  get subscriptions() {
    return this._subscriptionLogger.logs;
  }

  constructor(public messages: TestMessage<T>[], private _scheduler: TestScheduler) {
    super();
  }

  _subscribe(subscriber: Subscriber<T>) {
    const { _scheduler, _subscriptionLogger } = this;
    const subsLogIndex = _subscriptionLogger.logSubscription(_scheduler.now());
    const subs = new Subscription(() => {
      _subscriptionLogger.logUnsubscription(subsLogIndex, _scheduler.now());
    });
    subs.add(super._subscribe(subscriber));
    return subs;
  }

  setup() {
    const { _scheduler, messages } = this;
    for (let i = 0; i < messages.length && !this.closed; i++) {
      const { frame, notification } = messages[i];
      if (frame >= 0) {
        _scheduler.schedule(() => {
          notification.observe(this);
        }, frame);
      }
    }
  }
}

class ColdObservable<T> extends Observable<T> implements TestObservable<T> {
  private _subscriptionLogger = subscriptionLogger();

  get subscriptions() {
    return this._subscriptionLogger.logs;
  }

  constructor(public messages: TestMessage<T>[], private _scheduler: TestScheduler) {
    super();
  }

  _subscribe(subscriber: Subscriber<T>) {
    const { _subscriptionLogger, _scheduler, messages } = this;

    const subsLogIndex = _subscriptionLogger.logSubscription(_scheduler.now());

    const subs = new Subscription();

    subs.add(_scheduler.schedule(() => {
      for (let i = 0; i < messages.length && !subscriber.closed; i++) {
        const { notification, frame } = messages[i];
        subs.add(_scheduler.schedule(() => {
          notification.observe(subscriber);
        }, frame));
      }
    }));

    subs.add(() => _subscriptionLogger.logUnsubscription(subsLogIndex, _scheduler.now()));

    return subs;
  }
}
