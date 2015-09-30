import Observable from '../Observable';
import VirtualTimeScheduler from './VirtualTimeScheduler';
import Notification from '../Notification';
import Subject from '../Subject';

interface FlushableTest {
  observable: Observable<any>;
  marbles: string;
  ready: boolean;
  actual?: any[];
  expected?: any[];
}
export default FlushableTest;

interface SetupableTestSubject {
  setup: (scheduler: TestScheduler) => void;
  subject: Subject<any>;
}

export default class TestScheduler extends VirtualTimeScheduler {
  private setupableTestSubjects: SetupableTestSubject[] = [];
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
    return Observable.create(subscriber => {
      messages.forEach(({ notification, frame }) => {
        subscriber.add(this.schedule(() => {
          notification.observe(subscriber);
        }, frame));
      }, this);
    });
  }

  createHotObservable<T>(marbles: string, values?: any, error?: any): Subject<T> {
    if (marbles.indexOf('!') !== -1) {
      throw new Error('Hot observable cannot have unsubscription marker "!"');
    }
    let messages = TestScheduler.parseMarbles(marbles, values, error);
    let subject = new Subject();
    this.setupableTestSubjects.push({
      subject,
      setup(scheduler) {
        messages.forEach(({ notification, frame }) => {
          scheduler.schedule(() => {
            notification.observe(subject);
          }, frame);
        });
      }
    });
    return subject;
  }

  expect(observable: Observable<any>,
         unsubscriptionMarbles: string = null): ({ toBe: (marbles: string, values?: any, errorValue?: any) => void }) {
    let actual = [];
    let flushTest: FlushableTest = { observable, actual, marbles: null, ready: false };
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
        flushTest.marbles = marbles;
        flushTest.expected = TestScheduler.parseMarbles(marbles, values, errorValue);
      }
    };
  }

  flush() {
    const setupableTestSubjects = this.setupableTestSubjects;
    while (setupableTestSubjects.length > 0) {
      setupableTestSubjects.shift().setup(this);
    }

    super.flush();
    const readyFlushTests = this.flushTests.filter(test => test.ready);
    while (readyFlushTests.length > 0) {
      var test = readyFlushTests.shift();
      test.actual.sort((a, b) => a.frame === b.frame ? 0 : (a.frame > b.frame ? 1 : -1));
      this.assertDeepEqual(test.actual, test.expected);
    }
  }

  static getUnsubscriptionFrame(marbles?: string) {
    if (typeof marbles !== 'string' || marbles.indexOf('!') === -1) {
      return Number.POSITIVE_INFINITY;
    }
    return marbles.indexOf('!') * this.frameTimeFactor;
  }

  static parseMarbles(marbles: string, values?: any, errorValue?: any) : ({ frame: number, notification: Notification<any> })[] {
    if (marbles.indexOf('!') !== -1) {
      throw new Error('Conventional marble diagrams cannot have the ' +
        'unsubscription marker "!"');
    }
    let len = marbles.length;
    let results: ({ frame: number, notification: Notification<any> })[] = [];
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
        results.push({ frame: groupStart > -1 ? groupStart : frame, notification });
      }
    }
    return results;
  }
}