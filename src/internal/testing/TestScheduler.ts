import { Observable } from '../Observable';
import { ColdObservable } from './ColdObservable';
import { HotObservable } from './HotObservable';
import { TestMessage } from './TestMessage';
import { SubscriptionLog } from './SubscriptionLog';
import { Subscription } from '../Subscription';
import { VirtualTimeScheduler, VirtualAction } from '../scheduler/VirtualTimeScheduler';
import { AsyncScheduler } from '../scheduler/AsyncScheduler';
import { ObservableNotification } from '../types';
import { COMPLETE_NOTIFICATION, errorNotification, nextNotification } from '../Notification';
import { dateTimestampProvider } from '../scheduler/dateTimestampProvider';
import { performanceTimestampProvider } from '../scheduler/performanceTimestampProvider';
import { animationFrameProvider } from '../scheduler/animationFrameProvider';
import { immediateProvider } from '../scheduler/immediateProvider';
import { intervalProvider } from '../scheduler/intervalProvider';

const defaultMaxFrame: number = 750;

export interface RunHelpers {
  cold: typeof TestScheduler.prototype.createColdObservable;
  hot: typeof TestScheduler.prototype.createHotObservable;
  flush: typeof TestScheduler.prototype.flush;
  time: typeof TestScheduler.prototype.createTime;
  expectObservable: typeof TestScheduler.prototype.expectObservable;
  expectSubscriptions: typeof TestScheduler.prototype.expectSubscriptions;
  animate: (marbles: string) => void;
}

interface FlushableTest {
  ready: boolean;
  actual?: any[];
  expected?: any[];
}

export type observableToBeFn = (marbles: string, values?: any, errorValue?: any) => void;
export type subscriptionLogsToBeFn = (marbles: string | string[]) => void;

export class TestScheduler extends VirtualTimeScheduler {
  /**
   * The number of virtual time units each character in a marble diagram represents. If
   * the test scheduler is being used in "run mode", via the `run` method, this is temporarly
   * set to `1` for the duration of the `run` block, then set back to whatever value it was.
   * @nocollapse
   */
  static frameTimeFactor = 10;

  /**
   * @deprecated remove in v8. Not for public use.
   */
  public readonly hotObservables: HotObservable<any>[] = [];

  /**
   * @deprecated remove in v8. Not for public use.
   */
  public readonly coldObservables: ColdObservable<any>[] = [];

  /**
   * Test meta data to be processed during `flush()`
   */
  private flushTests: FlushableTest[] = [];

  /**
   * Indicates whether the TestScheduler instance is operating in "run mode",
   * meaning it's processing a call to `run()`
   */
  private runMode = false;

  /**
   *
   * @param assertDeepEqual A function to set up your assertion for your test harness
   */
  constructor(public assertDeepEqual: (actual: any, expected: any) => boolean | void) {
    super(VirtualAction, defaultMaxFrame);
  }

  createTime(marbles: string): number {
    const indexOf = marbles.trim().indexOf('|');
    if (indexOf === -1) {
      throw new Error('marble diagram for time should have a completion marker "|"');
    }
    return indexOf * TestScheduler.frameTimeFactor;
  }

  /**
   * @param marbles A diagram in the marble DSL. Letters map to keys in `values` if provided.
   * @param values Values to use for the letters in `marbles`. If ommitted, the letters themselves are used.
   * @param error The error to use for the `#` marble (if present).
   */
  createColdObservable<T = string>(marbles: string, values?: { [marble: string]: T }, error?: any): ColdObservable<T> {
    if (marbles.indexOf('^') !== -1) {
      throw new Error('cold observable cannot have subscription offset "^"');
    }
    if (marbles.indexOf('!') !== -1) {
      throw new Error('cold observable cannot have unsubscription marker "!"');
    }
    const messages = TestScheduler.parseMarbles(marbles, values, error, undefined, this.runMode);
    const cold = new ColdObservable<T>(messages, this);
    this.coldObservables.push(cold);
    return cold;
  }

  /**
   * @param marbles A diagram in the marble DSL. Letters map to keys in `values` if provided.
   * @param values Values to use for the letters in `marbles`. If ommitted, the letters themselves are used.
   * @param error The error to use for the `#` marble (if present).
   */
  createHotObservable<T = string>(marbles: string, values?: { [marble: string]: T }, error?: any): HotObservable<T> {
    if (marbles.indexOf('!') !== -1) {
      throw new Error('hot observable cannot have unsubscription marker "!"');
    }
    const messages = TestScheduler.parseMarbles(marbles, values, error, undefined, this.runMode);
    const subject = new HotObservable<T>(messages, this);
    this.hotObservables.push(subject);
    return subject;
  }

  private materializeInnerObservable(observable: Observable<any>,
                                     outerFrame: number): TestMessage[] {
    const messages: TestMessage[] = [];
    observable.subscribe((value) => {
      messages.push({ frame: this.frame - outerFrame, notification: nextNotification(value) });
    }, (error) => {
      messages.push({ frame: this.frame - outerFrame, notification: errorNotification(error) });
    }, () => {
      messages.push({ frame: this.frame - outerFrame, notification: COMPLETE_NOTIFICATION });
    });
    return messages;
  }

  expectObservable(observable: Observable<any>,
                   subscriptionMarbles: string | null = null): ({ toBe: observableToBeFn }) {
    const actual: TestMessage[] = [];
    const flushTest: FlushableTest = { actual, ready: false };
    const subscriptionParsed = TestScheduler.parseMarblesAsSubscriptions(subscriptionMarbles, this.runMode);
    const subscriptionFrame = subscriptionParsed.subscribedFrame === Infinity ?
      0 : subscriptionParsed.subscribedFrame;
    const unsubscriptionFrame = subscriptionParsed.unsubscribedFrame;
    let subscription: Subscription;

    this.schedule(() => {
      subscription = observable.subscribe(x => {
        let value = x;
        // Support Observable-of-Observables
        if (x instanceof Observable) {
          value = this.materializeInnerObservable(value, this.frame);
        }
        actual.push({ frame: this.frame, notification: nextNotification(value) });
      }, (error) => {
        actual.push({ frame: this.frame, notification: errorNotification(error) });
      }, () => {
        actual.push({ frame: this.frame, notification: COMPLETE_NOTIFICATION });
      });
    }, subscriptionFrame);

    if (unsubscriptionFrame !== Infinity) {
      this.schedule(() => subscription.unsubscribe(), unsubscriptionFrame);
    }

    this.flushTests.push(flushTest);
    const { runMode } = this;

    return {
      toBe(marbles: string, values?: any, errorValue?: any) {
        flushTest.ready = true;
        flushTest.expected = TestScheduler.parseMarbles(marbles, values, errorValue, true, runMode);
      }
    };
  }

  expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]): ({ toBe: subscriptionLogsToBeFn }) {
    const flushTest: FlushableTest = { actual: actualSubscriptionLogs, ready: false };
    this.flushTests.push(flushTest);
    const { runMode } = this;
    return {
      toBe(marbles: string | string[]) {
        const marblesArray: string[] = (typeof marbles === 'string') ? [marbles] : marbles;
        flushTest.ready = true;
        flushTest.expected = marblesArray.map(marbles =>
          TestScheduler.parseMarblesAsSubscriptions(marbles, runMode)
        ).filter(marbles => marbles.subscribedFrame !== Infinity);
      }
    };
  }

  flush() {
    const hotObservables = this.hotObservables;
    while (hotObservables.length > 0) {
      hotObservables.shift()!.setup();
    }

    super.flush();

    this.flushTests = this.flushTests.filter(test => {
      if (test.ready) {
        this.assertDeepEqual(test.actual, test.expected);
        return false;
      }
      return true;
    });
  }

  /** @nocollapse */
  static parseMarblesAsSubscriptions(marbles: string | null, runMode = false): SubscriptionLog {
    if (typeof marbles !== 'string') {
      return new SubscriptionLog(Infinity);
    }
    const len = marbles.length;
    let groupStart = -1;
    let subscriptionFrame = Infinity;
    let unsubscriptionFrame = Infinity;
    let frame = 0;

    for (let i = 0; i < len; i++) {
      let nextFrame = frame;
      const advanceFrameBy = (count: number) => {
        nextFrame += count * this.frameTimeFactor;
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
          if (subscriptionFrame !== Infinity) {
            throw new Error('found a second subscription point \'^\' in a ' +
              'subscription marble diagram. There can only be one.');
          }
          subscriptionFrame = groupStart > -1 ? groupStart : frame;
          advanceFrameBy(1);
          break;
        case '!':
          if (unsubscriptionFrame !== Infinity) {
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

                advanceFrameBy(durationInMs! / this.frameTimeFactor);
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
      return new SubscriptionLog(subscriptionFrame);
    } else {
      return new SubscriptionLog(subscriptionFrame, unsubscriptionFrame);
    }
  }

  /** @nocollapse */
  static parseMarbles(marbles: string,
                      values?: any,
                      errorValue?: any,
                      materializeInnerObservables: boolean = false,
                      runMode = false): TestMessage[] {
    if (marbles.indexOf('!') !== -1) {
      throw new Error('conventional marble diagrams cannot have the ' +
        'unsubscription marker "!"');
    }
    const len = marbles.length;
    const testMessages: TestMessage[] = [];
    const subIndex = runMode ? marbles.replace(/^[ ]+/, '').indexOf('^') : marbles.indexOf('^');
    let frame = subIndex === -1 ? 0 : (subIndex * -this.frameTimeFactor);
    const getValue = typeof values !== 'object' ?
      (x: any) => x :
      (x: any) => {
        // Support Observable-of-Observables
        if (materializeInnerObservables && values[x] instanceof ColdObservable) {
          return values[x].messages;
        }
        return values[x];
      };
    let groupStart = -1;

    for (let i = 0; i < len; i++) {
      let nextFrame = frame;
      const advanceFrameBy = (count: number) => {
        nextFrame += count * this.frameTimeFactor;
      };

      let notification: ObservableNotification<any> | undefined;
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
          notification = COMPLETE_NOTIFICATION;
          advanceFrameBy(1);
          break;
        case '^':
          advanceFrameBy(1);
          break;
        case '#':
          notification = errorNotification(errorValue || 'error');
          advanceFrameBy(1);
          break;
        default:
          // Might be time progression syntax, or a value literal
          if (runMode && c.match(/^[0-9]$/)) {
            // Time progression must be preceded by at least one space
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

                advanceFrameBy(durationInMs! / this.frameTimeFactor);
                break;
              }
            }
          }

          notification = nextNotification(getValue(c));
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

  private createAnimator() {
    if (!this.runMode) {
      throw new Error('animate() must only be used in run mode');
    }

    // The TestScheduler assigns a delegate to the provider that's used for
    // requestAnimationFrame (rAF). The delegate works in conjunction with the
    // animate run helper to coordinate the invocation of any rAF callbacks,
    // that are effected within tests, with the animation frames specified by
    // the test's author - in the marbles that are passed to the animate run
    // helper. This allows the test's author to write deterministic tests and
    // gives the author full control over when - or if - animation frames are
    // 'painted'.

    let lastHandle = 0;
    let map: Map<number, FrameRequestCallback> | undefined;

    const delegate = {
      requestAnimationFrame(callback: FrameRequestCallback) {
        if (!map) {
          throw new Error("animate() was not called within run()");
        }
        const handle = ++lastHandle;
        map.set(handle, callback);
        return handle;
      },
      cancelAnimationFrame(handle: number) {
        if (!map) {
          throw new Error("animate() was not called within run()");
        }
        map.delete(handle);
      }
    };

    const animate = (marbles: string) => {
      if (map) {
        throw new Error('animate() must not be called more than once within run()');
      }
      if (/[|#]/.test(marbles)) {
        throw new Error('animate() must not complete or error')
      }
      map = new Map<number, FrameRequestCallback>();
      const messages = TestScheduler.parseMarbles(marbles, undefined, undefined, undefined, true);
      for (const message of messages) {
        this.schedule(() => {
          const now = this.now();
          // Capture the callbacks within the queue and clear the queue
          // before enumerating the callbacks, as callbacks might
          // reschedule themselves. (And, yeah, we're using a Map to represent
          // the queue, but the values are guaranteed to be returned in
          // insertion order, so it's all good. Trust me, I've read the docs.)
          const callbacks = Array.from(map!.values());
          map!.clear();
          for (const callback of callbacks) {
            callback(now);
          }
        }, message.frame);
      }
    };

    return { animate, delegate };
  }

  private createDelegates() {
    // When in run mode, the TestScheduler provides alternate implementations
    // of set/clearImmediate and set/clearInterval. These implementations are
    // consumed by the scheduler implementations via the providers. This is
    // done to effect deterministic asap and async scheduler behavior so that
    // all of the schedulers are testable in 'run mode'. Prior to v7,
    // delegation occurred at the scheduler level. That is, the asap and
    // animation frame schedulers were identical in behavior to the async
    // scheduler. Now, when in run mode, asap actions are prioritized over
    // async actions and animation frame actions are coordinated using the
    // animate run helper.

    let lastHandle = 0;
    let map = new Map<number, {
      due: number;
      duration: number;
      handle: number;
      handler: () => void;
      subscription: Subscription;
      type: 'immediate' | 'interval';
    }>();

    const run = () => {
      // Whenever a scheduled run is executed, it must run a single immediate
      // or interval action - with immediate actions being prioritized over
      // interval actions. 
      const now = this.now();
      const values = Array.from(map.values());
      const due = values.filter(({ due }) => due <= now);
      const immediates = due.filter(({ type }) => type === 'immediate');
      if (immediates.length > 0) {
        const { handle, handler } = immediates[0];
        map.delete(handle);
        handler();
        return;
      }
      const intervals = due.filter(({ type }) => type === 'interval');
      if (intervals.length > 0) {
        const interval = intervals[0];
        const { duration, handler } = interval;
        interval.due = now + duration;
        // The interval delegate must behave like setInterval, so run needs to
        // be rescheduled. This will continue until the clearInterval delegate
        // unsubscribes and deletes the handle from the map.
        interval.subscription = this.schedule(run, duration);
        handler();
        return;
      }
      throw new Error('Expected a due immediate or interval');
    };

    const immediate = {
      setImmediate: (handler: () => void) => {
        const handle = ++lastHandle;
        map.set(handle, {
          due: this.now(),
          duration: 0,
          handle,
          handler,
          subscription: this.schedule(run, 0),
          type: 'immediate',
        });
        return handle;
      },
      clearImmediate: (handle: number) => {
        const value = map.get(handle);
        if (value) {
          value.subscription.unsubscribe();
          map.delete(handle);
        }
      }
    };

    const interval = {
      setInterval: (handler: () => void, duration = 0) => {
        const handle = ++lastHandle;
        map.set(handle, {
          due: this.now() + duration,
          duration,
          handle,
          handler,
          subscription: this.schedule(run, duration),
          type: 'interval',
        });
        return handle;
      },
      clearInterval: (handle: number) => {
        const value = map.get(handle);
        if (value) {
          value.subscription.unsubscribe();
          map.delete(handle);
        }
      }
    };

    return { immediate, interval };
  }

  /**
   * The `run` method performs the test in 'run mode' - in which schedulers
   * used within the test automatically delegate to the `TestScheduler`. That
   * is, in 'run mode' there is no need to explicitly pass a `TestScheduler`
   * instance to observable creators or operators.
   *
   * @see {@link /guide/testing/marble-testing}
   */
  run<T>(callback: (helpers: RunHelpers) => T): T {
    const prevFrameTimeFactor = TestScheduler.frameTimeFactor;
    const prevMaxFrames = this.maxFrames;

    TestScheduler.frameTimeFactor = 1;
    this.maxFrames = Infinity;
    this.runMode = true;

    const animator = this.createAnimator();
    const delegates = this.createDelegates();

    animationFrameProvider.delegate = animator.delegate;
    dateTimestampProvider.delegate = this;
    immediateProvider.delegate = delegates.immediate;
    intervalProvider.delegate = delegates.interval;
    performanceTimestampProvider.delegate = this;

    const helpers: RunHelpers = {
      cold: this.createColdObservable.bind(this),
      hot: this.createHotObservable.bind(this),
      flush: this.flush.bind(this),
      time: this.createTime.bind(this),
      expectObservable: this.expectObservable.bind(this),
      expectSubscriptions: this.expectSubscriptions.bind(this),
      animate: animator.animate,
    };
    try {
      const ret = callback(helpers);
      this.flush();
      return ret;
    } finally {
      TestScheduler.frameTimeFactor = prevFrameTimeFactor;
      this.maxFrames = prevMaxFrames;
      this.runMode = false;
      animationFrameProvider.delegate = undefined;
      dateTimestampProvider.delegate = undefined;
      immediateProvider.delegate = undefined;
      intervalProvider.delegate = undefined;
      performanceTimestampProvider.delegate = undefined;
    }
  }
}
