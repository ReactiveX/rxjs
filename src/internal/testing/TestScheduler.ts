import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { VirtualTimeScheduler} from 'rxjs/internal/scheduler/VirtualTimeScheduler';
import { NotificationLike, SchedulerLike, FOType, Sink } from 'rxjs/internal/types';
import { isObservable } from 'rxjs/internal/util/isObservable';
import { asyncScheduler } from 'rxjs/internal/scheduler/asyncScheduler';
import { asapScheduler } from 'rxjs/internal/scheduler/asapScheduler';
import { QueueScheduler } from 'rxjs/internal/scheduler/QueueScheduler';
import { Subject } from '../Subject';
import { Notification } from '../Notification';

// TODO(benlesh): we need to figure out how to have TestScheduler support testing
// the animation frame scheduler
function createSchedulerPatch(scheduler: SchedulerLike): SchedulerPatch {
  return {
    _schedule: null,
    _now: null,
    _patched: false,
    patch(testScheduler) {
      if (!this._patched) {
        this._patched = true;
        this._schedule = scheduler.schedule;
        this._now = scheduler.now;
        scheduler.schedule = testScheduler.schedule.bind(testScheduler);
        scheduler.now = testScheduler.now.bind(testScheduler);
      }
    },
    unpatch() {
      if (this._patched) {
        scheduler.schedule = this._schedule;
        scheduler.now = this._now;
      }
      this._patched = false;
    }
  };
}

// Since the queue flushes synchronously, and any delay over 0 is pushed through
// the asyncScheduler, which is already patched, queueScheduler only needs to patch
// the now function.
const QUEUE_SCHEDULER_PATCH: SchedulerPatch = {
  _now: null,
  _patched: false,
  patch(testScheduler) {
    if (!this._patched) {
      this._patched = true;
      this._now = QueueScheduler.prototype.now;
      QueueScheduler.prototype.now = testScheduler.now.bind(testScheduler);
    }
  },
  unpatch() {
    if (this._patched) {
      QueueScheduler.prototype.now = this._now;
    }
    this._patched = false;
  }
};

const DEFAULT_SCHEDULER_PATCHES: SchedulerPatch[] = [
  createSchedulerPatch(asyncScheduler),
  createSchedulerPatch(asapScheduler),
  QUEUE_SCHEDULER_PATCH,
];

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

export abstract class TestObservable<T> extends Observable<T> {
  subscriptions: SubscriptionLog[] = [];
  messages: TestMessage<T>[] = [];
}

export type observableToBeFn = (marbles: string, values?: any, errorValue?: any) => void;
export type subscriptionLogsToBeFn = (marbles: string | string[]) => void;

export class TestScheduler extends VirtualTimeScheduler {
  private _runMode = false;
  private _flushTests: FlushableTest[] = [];
  private _patches = DEFAULT_SCHEDULER_PATCHES;

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
  const cold = coldObservable<T>(messages, this as TestScheduler);
  this._coldObservables.push(cold);
  return cold;
  }

  createHotObservable<T = string>(marbles: string, values?: { [marble: string]: T }, error?: any): HotObservable<T> {
    if (marbles.indexOf('!') !== -1) {
      throw new Error('hot observable cannot have unsubscription marker "!"');
    }
    const messages = parseMarbles(marbles, values, error, undefined, this._runMode);
    const subject = hotObservable<T>(messages, this as TestScheduler);
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

    const patches: SchedulerPatch[] = this._patches;

    // Patch the schedulers
    patches.forEach(patch => patch.patch(this));

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
      this.maxFrames = prevMaxFrames;
      this._runMode = false;
      // Unpatch the schedulers
      patches.forEach(patch => patch.unpatch());
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
        // console.log(JSON.stringify(test.actual, null, 2));
        // console.log(JSON.stringify(test.expected, null, 2));
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
export interface HotObservable<T> extends Subject<T> {
  setup(): void;
  subscriptions: SubscriptionLog[];
  messages: TestMessage<T>[];
}

export function hotObservable<T>(messages: TestMessage<T>[], scheduler: TestScheduler): HotObservable<T> {
  const subsLogger = subscriptionLogger();

  const result = new Subject<T>();

  const _subscribe = result.subscribe;

  result.subscribe = function() {
    const subsLogIndex = subsLogger.logSubscription(scheduler.now());

    const subs = new Subscription();

    subs.add(() => subsLogger.logUnsubscription(subsLogIndex, scheduler.now()));

    subs.add(_subscribe.apply(result, arguments));

    return subs;
  };

  (result as any).subscriptions = subsLogger.logs;
  (result as any).messages = messages;
  (result as any).setup = () => {
    const subs = new Subscription();
    scheduler.schedule(() => {
      for (const { frame, notification } of messages) {

        subs.add(scheduler.schedule(() => {
          notification.observe(result);
        }, frame));
      }
    });
  };
  return result as HotObservable<T>;
}

export function coldObservable<T>(messages: TestMessage<T>[], scheduler: TestScheduler): TestObservable<T> {
  const subsLogger = subscriptionLogger();

  const result = new Observable<T>(subscriber => {
    const subsLogIndex = subsLogger.logSubscription(scheduler.now());

    const subs = new Subscription();

    subs.add(() => subsLogger.logUnsubscription(subsLogIndex, scheduler.now()));

    subs.add(scheduler.schedule(() => {
      for (const message of messages) {
        const { notification, frame } = message;
        subs.add(scheduler.schedule(() => {
          notification.observe(subscriber);
        }, frame));
      }
    }));

    return subs;
  });

  (result as TestObservable<T>).subscriptions = subsLogger.logs;
  (result as TestObservable<T>).messages = messages;

  return result as TestObservable<T>;
}
