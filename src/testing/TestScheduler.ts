import { Observable } from '../Observable';
import { Notification } from '../Notification';
import { ColdObservable } from './ColdObservable';
import { HotObservable } from './HotObservable';
import { TestMessage } from './TestMessage';
import { SubscriptionLog } from './SubscriptionLog';
import { Subscription } from '../Subscription';
import { VirtualTimeScheduler, VirtualAction } from '../scheduler/VirtualTimeScheduler';

import * as _ from 'lodash';

const defaultMaxFrame: number = 750;

interface FlushableTest {
  ready: boolean;
  actual?: any[];
  expected?: any[];
  assertion?: (actual: any, expected: any) => boolean | void;
}

type Emission<T> = { frame: number, notification: Notification<T> };

export type observableToBeFn = (marbles: string, values?: any, errorValue?: any) => void;
export type observableToFn = (
  assertion: (actual: any, expected: any) => boolean | void,
  marbles: string,
  values?: any, errorValue?: any
) => void;
export type subscriptionLogsToBeFn = (marbles: string | string[]) => void;

export class TestScheduler extends VirtualTimeScheduler {
  private hotObservables: HotObservable<any>[] = [];
  private coldObservables: ColdObservable<any>[] = [];
  private flushTests: FlushableTest[] = [];

  constructor(public assertDeepEqual: (actual: any, expected: any) => boolean | void) {
    super(VirtualAction, defaultMaxFrame);
  }

  createTime(marbles: string): number {
    const indexOf: number = marbles.indexOf('|');
    if (indexOf === -1) {
      throw new Error('marble diagram for time should have a completion marker "|"');
    }
    return indexOf * TestScheduler.frameTimeFactor;
  }

  createColdObservable<T>(marbles: string, values?: any, error?: any): ColdObservable<T> {
    if (marbles.indexOf('^') !== -1) {
      throw new Error('cold observable cannot have subscription offset "^"');
    }
    if (marbles.indexOf('!') !== -1) {
      throw new Error('cold observable cannot have unsubscription marker "!"');
    }
    const messages = TestScheduler.parseMarbles(marbles, values, error);
    const cold = new ColdObservable<T>(messages, this);
    this.coldObservables.push(cold);
    return cold;
  }

  createHotObservable<T>(marbles: string, values?: any, error?: any): HotObservable<T> {
    if (marbles.indexOf('!') !== -1) {
      throw new Error('hot observable cannot have unsubscription marker "!"');
    }
    const messages = TestScheduler.parseMarbles(marbles, values, error);
    const subject = new HotObservable<T>(messages, this);
    this.hotObservables.push(subject);
    return subject;
  }

  private materializeInnerObservable(observable: Observable<any>,
                                     outerFrame: number): TestMessage[] {
    const messages: TestMessage[] = [];
    observable.subscribe((value) => {
      messages.push({ frame: this.frame - outerFrame, notification: Notification.createNext(value) });
    }, (err) => {
      messages.push({ frame: this.frame - outerFrame, notification: Notification.createError(err) });
    }, () => {
      messages.push({ frame: this.frame - outerFrame, notification: Notification.createComplete() });
    });
    return messages;
  }

  expectObservable(observable: Observable<any>,
                   unsubscriptionMarbles: string = null): ({ toBe: observableToBeFn, to: observableToFn }) {
    const actual: TestMessage[] = [];
    const flushTest: FlushableTest = { actual, ready: false };
    const unsubscriptionFrame = TestScheduler
      .parseMarblesAsSubscriptions(unsubscriptionMarbles).unsubscribedFrame;
    let subscription: Subscription;

    this.schedule(() => {
      subscription = observable.subscribe(x => {
        let value = x;
        // Support Observable-of-Observables
        if (x instanceof Observable) {
          value = this.materializeInnerObservable(value, this.frame);
        }
        actual.push({ frame: this.frame, notification: Notification.createNext(value) });
      }, (err) => {
        actual.push({ frame: this.frame, notification: Notification.createError(err) });
      }, () => {
        actual.push({ frame: this.frame, notification: Notification.createComplete() });
      });
    }, 0);

    if (unsubscriptionFrame !== Number.POSITIVE_INFINITY) {
      this.schedule(() => subscription.unsubscribe(), unsubscriptionFrame);
    }

    this.flushTests.push(flushTest);
    const equal = _.isEqual;

    return {
      toBe(marbles: string, values?: any, errorValue?: any) {
        flushTest.assertion = equal;
        flushTest.ready = true;
        flushTest.expected = TestScheduler.parseMarbles(marbles, values, errorValue, true);
      },
      to(assertion: (actual: any, expected: any) => boolean | void, marbles: string, values?: any, errorValue?: any) {
        flushTest.assertion = assertion;
        flushTest.ready = true;
        flushTest.expected = TestScheduler.parseMarbles(marbles, values, errorValue, true);
      }
    };
  }

  expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]): ({ toBe: subscriptionLogsToBeFn }) {
    const flushTest: FlushableTest = { actual: actualSubscriptionLogs, ready: false };
    this.flushTests.push(flushTest);
    return {
      toBe(marbles: string | string[]) {
        const marblesArray: string[] = (typeof marbles === 'string') ? [marbles] : marbles;
        flushTest.ready = true;
        flushTest.expected = marblesArray.map(marbles =>
          TestScheduler.parseMarblesAsSubscriptions(marbles)
        );
      }
    };
  }

  stringify(x: any): string {
    return JSON.stringify(x, (key: string, value: any) => {
      if (Array.isArray(value)) {
        return '[' + value
          .map((i) => {
            return '\n\t' + this.stringify(i);
          }) + '\n]';
      }
      return value;
    })
      .replace(/\\"/g, '"')
      .replace(/\\t/g, '\t')
      .replace(/\\n/g, '\n');
  }

  notificationToString(notification: Notification<any>, frame: number): string | void {
    switch (notification.kind) {
      case 'N':
        return `value of ${this.stringify(notification.value)} at frame ${frame}`;
      case 'E':
        return `error of '${notification.error}' at frame ${frame}`;
      case 'C':
        return `completed at frame ${frame}`;
    }
  }

  private normalizeEmission(emission: Emission<any>) {
    const { notification } = emission;
    if (notification) {
      const { kind, error } = notification;
      if (kind === 'E' && error instanceof Error) {
        notification.error = { name: error.name, message: error.message };
      }
    }
    return emission;
  }

  private assertEmission(actual: Emission<any>, expected: Emission<any>, assertion: (actual: any, expected: any) => void) {
    actual = this.normalizeEmission(actual);
    expected = this.normalizeEmission(expected);

    if (
      !actual
      || !expected
      || (actual.frame !== expected.frame)
      || (actual.notification.kind !== expected.notification.kind)
      || (expected.notification.kind === 'E' && !_.isEqual(actual, expected))
    ) {
      const expectedString = expected ? this.notificationToString(expected.notification, expected.frame) : undefined;
      const actualString = actual ? this.notificationToString(actual.notification, actual.frame) : undefined;

      const expectedErrorString = expectedString ? `Expected observable to emit ${expectedString}` : '';
      const isExpected = !expectedString ? 'unexpectedly ' : '';
      const actualErrorString = actualString ? `Observable ${isExpected}emitted ${actualString}` : '';
      const combinedErrorString = [expectedErrorString, actualErrorString]
        .filter(string => string != '')
        .join('; ');

      throw new Error(combinedErrorString);
    }

    if (expected.notification.kind === 'N') {
      try {
        assertion(actual.notification.value, expected.notification.value);
      } catch (e) {
        e.message = e.message + ` at frame ${expected.frame}`;
        throw e;
      }
    }
  }

  flush() {
    const hotObservables = this.hotObservables;
    while (hotObservables.length > 0) {
      hotObservables.shift().setup();
    }

    super.flush();
    const readyFlushTests = this.flushTests.filter(test => test.ready);
    while (readyFlushTests.length > 0) {
      const test = readyFlushTests.shift();
      const streamLength = test.expected.length >= test.actual.length ? test.expected.length : test.actual.length;

      for (let idx = 0; idx < streamLength; idx++) {
        const expectedEmission = (idx in test.expected) ? test.expected[idx] : undefined;
        const actualEmission = (idx in test.actual) ? test.actual[idx] : undefined;

        if (actualEmission instanceof SubscriptionLog || expectedEmission instanceof SubscriptionLog) {
          _.isEqual(actualEmission, expectedEmission);
          continue;
        }

        this.assertEmission(actualEmission, expectedEmission, test.assertion);
      }
    }
  }

  static parseMarblesAsSubscriptions(marbles: string): SubscriptionLog {
    if (typeof marbles !== 'string') {
      return new SubscriptionLog(Number.POSITIVE_INFINITY);
    }
    const len = marbles.length;
    let groupStart = -1;
    let subscriptionFrame = Number.POSITIVE_INFINITY;
    let unsubscriptionFrame = Number.POSITIVE_INFINITY;

    for (let i = 0; i < len; i++) {
      const frame = i * this.frameTimeFactor;
      const c = marbles[i];
      switch (c) {
        case '-':
        case ' ':
          break;
        case '(':
          groupStart = frame;
          break;
        case ')':
          groupStart = -1;
          break;
        case '^':
          if (subscriptionFrame !== Number.POSITIVE_INFINITY) {
            throw new Error('found a second subscription point \'^\' in a ' +
              'subscription marble diagram. There can only be one.');
          }
          subscriptionFrame = groupStart > -1 ? groupStart : frame;
          break;
        case '!':
          if (unsubscriptionFrame !== Number.POSITIVE_INFINITY) {
            throw new Error('found a second subscription point \'^\' in a ' +
              'subscription marble diagram. There can only be one.');
          }
          unsubscriptionFrame = groupStart > -1 ? groupStart : frame;
          break;
        default:
          throw new Error('there can only be \'^\' and \'!\' markers in a ' +
            'subscription marble diagram. Found instead \'' + c + '\'.');
      }
    }

    if (unsubscriptionFrame < 0) {
      return new SubscriptionLog(subscriptionFrame);
    } else {
      return new SubscriptionLog(subscriptionFrame, unsubscriptionFrame);
    }
  }

  static parseMarbles(marbles: string,
                      values?: any,
                      errorValue?: any,
                      materializeInnerObservables: boolean = false): TestMessage[] {
    if (marbles.indexOf('!') !== -1) {
      throw new Error('conventional marble diagrams cannot have the ' +
        'unsubscription marker "!"');
    }
    const len = marbles.length;
    const testMessages: TestMessage[] = [];
    const subIndex = marbles.indexOf('^');
    const frameOffset = subIndex === -1 ? 0 : (subIndex * -this.frameTimeFactor);
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
      const frame = i * this.frameTimeFactor + frameOffset;
      let notification: Notification<any>;
      const c = marbles[i];
      switch (c) {
        case '-':
        case ' ':
          break;
        case '(':
          groupStart = frame;
          break;
        case ')':
          groupStart = -1;
          break;
        case '|':
          notification = Notification.createComplete();
          break;
        case '^':
          break;
        case '#':
          notification = Notification.createError(errorValue || 'error');
          break;
        default:
          notification = Notification.createNext(getValue(c));
          break;
      }

      if (notification) {
        testMessages.push({ frame: groupStart > -1 ? groupStart : frame, notification });
      }
    }
    return testMessages;
  }
}
