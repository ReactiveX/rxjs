import Observable from '../Observable';
import VirtualTimeScheduler from './VirtualTimeScheduler';
import Notification from '../Notification';
import Subject from '../Subject';

export default class TestScheduler extends VirtualTimeScheduler {
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
      });
    });
  }
  
  createHotObservable(marbles: string, values?: any, error?: any) {
    let messages = TestScheduler.parseMarbles(marbles, values, error);
    let subject = new Subject();
    messages.forEach(({ notification, frame }) => {
      this.schedule(() => {
        notification.observe(subject);
      }, frame);
    });
    return subject;
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