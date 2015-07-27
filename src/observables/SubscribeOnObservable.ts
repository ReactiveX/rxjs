import Scheduler from '../Scheduler';
import Observable from '../Observable';

export default class SubscribeOnObservable<T> extends Observable<T> {

  static create<T>(source: Observable<T>, delay: number = 0, scheduler: Scheduler = Scheduler.nextTick) {
    return new SubscribeOnObservable(source, delay, scheduler);
  }

  static dispatch({ source, subscriber }) {
    return source.subscribe(subscriber);
  }

  constructor(public    source: Observable<T>,
              protected delay: number = 0,
              protected scheduler: Scheduler = Scheduler.nextTick) {
    super();
  }

  _subscribe(subscriber) {

    const delay = this.delay;
    const source = this.source;
    const scheduler = this.scheduler;

    subscriber.add(scheduler.schedule(delay, {
      source, subscriber
    }, SubscribeOnObservable.dispatch));
  }
}
