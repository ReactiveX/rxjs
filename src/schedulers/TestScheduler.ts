import Observable from '../Observable';
import VirtualTimeScheduler from './VirtualTimeScheduler';
import Notification from '../Notification';
import Subject from '../Subject';

export default class TestScheduler extends VirtualTimeScheduler {
  constructor(public assertDeepEqual: (actual: any, expected: any) => boolean | void) {
    super();
  }
  
  createColdObservable(marbles: string, values?: any, error?: any) {
    if (marbles.indexOf('^') !== -1) {
      throw new Error('cold observable cannot have subscription offset "^"');
    }
    let messages = TestScheduler.parseMarbles(marbles, values, error);
    return Observable.create(subscriber => {
      messages.forEach(({ notification, frame }) => {
        this.schedule(() => {
          notification.observe(subscriber);
        }, frame);
      }, this);
    });
  }
  
  createHotObservable(marbles: string, values?: any, error?: any) {
    let messages = TestScheduler.parseMarbles(marbles, values, error);
    let subject = new Subject();
    messages.forEach(({ notification, frame }) => {
      this.schedule(() => {
        notification.observe(subject);
      }, frame);
    }, this);
    return subject;
  }
  
  flushTests: ({ observable: Observable<any>, marbles: string, actual?: any[], expected?: any[], ready: boolean })[] = [];
  
  expect(observable: Observable<any>): ({ toBe: (marbles: string, values?: any, errorValue?: any) => void }) {
    let actual = [];
    let flushTest: ({ observable: Observable<any>, marbles: string, actual?: any[], expected?: any[], ready:boolean }) = {
      observable, actual, marbles: null, ready: false
    };
    
    this.schedule(() => {
      observable.subscribe((value) => {
        actual.push({ frame: this.frame, notification: Notification.createNext(value) });
      }, (err) => {
        actual.push({ frame: this.frame, notification: Notification.createError(err) });
      }, () => {
        actual.push({ frame: this.frame, notification: Notification.createComplete() });
      });
    }, 0);
    
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
    super.flush();
    const flushTests = this.flushTests.filter(test => test.ready);
    while (flushTests.length > 0) {
      var test = flushTests.shift();
      this.assertDeepEqual(test.actual, test.expected);
    }
  }
  
  static parseMarbles(marbles: string, values?: any, errorValue?: any) : ({ notification: Notification<any>, frame: number })[] {
    let len = marbles.length;
    let results: ({ notification: Notification<any>, frame: number })[] = [];
    let subIndex = marbles.indexOf('^');
    let frameOffset = subIndex === -1 ? 0 : (subIndex * -10);
    
    for (let i = 0; i < len; i++) {
      let frame = i * 10;
      let notification;
      let c = marbles[i];
      switch (c) {
        case '-':
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
          notification = Notification.createNext(values[c]);
          break;
      }
      
      frame += frameOffset;
      
      if (notification) {
        results.push({ notification, frame });
      }
    }
    return results;
  }
}