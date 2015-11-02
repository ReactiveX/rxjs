import Scheduler from '../Scheduler';
import Subscriber from '../Subscriber';
import Subscription from '../Subscription';
import Observable from '../Observable';
import nextTick from '../schedulers/nextTick';
import isNumeric from '../util/isNumeric';

export default class SubscribeOnObservable<T> extends Observable<T> {
  static create<T>(source: Observable<T>, delay: number = 0, scheduler: Scheduler = nextTick): Observable<T> {
    return new SubscribeOnObservable(source, delay, scheduler);
  }

  static dispatch<T>({ source, subscriber }): Subscription<T> {
    return source.subscribe(subscriber);
  }

  constructor(public source: Observable<T>,
              private delayTime: number = 0,
              private scheduler: Scheduler = nextTick) {
    super();
    if (!isNumeric(delayTime) || delayTime < 0) {
      this.delayTime = 0;
    }
    if (!scheduler || typeof scheduler.schedule !== 'function') {
      this.scheduler = nextTick;
    }
  }

  _subscribe(subscriber: Subscriber<T>) {
    const delay = this.delayTime;
    const source = this.source;
    const scheduler = this.scheduler;

    subscriber.add(scheduler.schedule(SubscribeOnObservable.dispatch, delay, {
      source, subscriber
    }));
  }
}
