import Observable from '../Observable';
import VirtualTimeScheduler from '../schedulers/VirtualTimeScheduler';
import Notification from '../Notification';
import Subject from '../Subject';
import ColdObservable from './ColdObservable';
import HotObservable from './HotObservable';
import TestMessage from './TestMessage';
import SubscriptionLog from './SubscriptionLog';

interface FlushableTest {
  ready: boolean;
  actual?: any[];
  expected?: any[];
}

export type observableToBeFn = (marbles: string, values?: any, errorValue?: any) => void;
export type subscriptionLogsToBeFn = (marbles: string | string[]) => void;

export class TestScheduler extends VirtualTimeScheduler {
  private hotObservables: HotObservable<any>[] = [];
  private flushTests: FlushableTest[] = [];

  constructor(public assertDeepEqual: (actual: any, expected: any) => boolean | void) {
    super();
  }

  createColdObservable(marbles: string, values?: any, error?: any) {
    if (marbles.indexOf('^') !== -1) {
      throw new Error('Cold observable cannot have subscription offset "^"');
    }
    if (marbles.indexOf('!') !== -1) {
      throw new Error('Cold observable cannot have unsubscription marker "!"');
    }
    let messages = TestScheduler.parseMarbles(marbles, values, error);
    return new ColdObservable(messages, this);
  }

  createHotObservable<T>(marbles: string, values?: any, error?: any): Subject<T> {
    if (marbles.indexOf('!') !== -1) {
      throw new Error('Hot observable cannot have unsubscription marker "!"');
    }
    let messages = TestScheduler.parseMarbles(marbles, values, error);
    const subject = new HotObservable(messages, this);
    this.hotObservables.push(subject);
    return subject;
  }

  expectObservable(observable: Observable<any>,
                   unsubscriptionMarbles: string = null): ({ toBe: observableToBeFn }) {
    let actual: TestMessage[] = [];
    let flushTest: FlushableTest = { actual, ready: false };
    let unsubscriptionFrame = TestScheduler.getUnsubscriptionFrame(unsubscriptionMarbles);
    let subscription;

    this.schedule(() => {
      subscription = observable.subscribe((value) => {
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

    return {
      toBe(marbles: string, values?: any, errorValue?: any) {
        flushTest.ready = true;
        flushTest.expected = TestScheduler.parseMarbles(marbles, values, errorValue);
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

  flush() {
    const hotObservables = this.hotObservables;
    while (hotObservables.length > 0) {
      hotObservables.shift().setup();
    }

    super.flush();
    const readyFlushTests = this.flushTests.filter(test => test.ready);
    while (readyFlushTests.length > 0) {
      let test = readyFlushTests.shift();
      this.assertDeepEqual(test.actual, test.expected);
    }
  }

  static getUnsubscriptionFrame(marbles?: string) {
    if (typeof marbles !== 'string' || marbles.indexOf('!') === -1) {
      return Number.POSITIVE_INFINITY;
    }
    return marbles.indexOf('!') * this.frameTimeFactor;
  }

  static parseMarblesAsSubscriptions(marbles: string): SubscriptionLog {
    let len = marbles.length;
    let groupStart = -1;
    let subscriptionFrame = -1;
    let unsubscriptionFrame = -1;

    for (let i = 0; i < len; i++) {
      let frame = i * this.frameTimeFactor;
      let c = marbles[i];
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
          if (subscriptionFrame !== -1) {
            throw new Error('Found a second subscription point \'^\' in a ' +
              'subscription marble diagram. There can only be one.');
          }
          subscriptionFrame = groupStart > -1 ? groupStart : frame;
          break;
        case '!':
          if (unsubscriptionFrame !== -1) {
            throw new Error('Found a second subscription point \'^\' in a ' +
              'subscription marble diagram. There can only be one.');
          }
          unsubscriptionFrame = groupStart > -1 ? groupStart : frame;
          break;
        default:
          throw new Error('There can only be \'^\' and \'!\' markers in a ' +
            'subscription marble diagram. Found instead \'' + c + '\'.');
      }
    }

    if (unsubscriptionFrame < 0) {
      return new SubscriptionLog(subscriptionFrame);
    } else {
      return new SubscriptionLog(subscriptionFrame, unsubscriptionFrame);
    }
  }

  static parseMarbles(marbles: string, values?: any, errorValue?: any): TestMessage[] {
    if (marbles.indexOf('!') !== -1) {
      throw new Error('Conventional marble diagrams cannot have the ' +
        'unsubscription marker "!"');
    }
    let len = marbles.length;
    let testMessages: TestMessage[] = [];
    let subIndex = marbles.indexOf('^');
    let frameOffset = subIndex === -1 ? 0 : (subIndex * -this.frameTimeFactor);
    let getValue = typeof values !== 'object' ? (x) => x : (x) => values[x];
    let groupStart = -1;

    for (let i = 0; i < len; i++) {
      let frame = i * this.frameTimeFactor;
      let notification;
      let c = marbles[i];
      switch (c) {
        case '-':
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

      frame += frameOffset;

      if (notification) {
        testMessages.push({ frame: groupStart > -1 ? groupStart : frame, notification });
      }
    }
    return testMessages;
  }
}