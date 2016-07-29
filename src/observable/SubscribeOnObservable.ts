import {Scheduler} from '../Scheduler';
import {Subscriber} from '../Subscriber';
import {Subscription} from '../Subscription';
import {Observable, IObservable} from '../Observable';
import {asap} from '../scheduler/asap';
import {isNumeric} from '../util/isNumeric';

export interface DispatchArg<T> {
  source: IObservable<T>;
  subscriber: Subscriber<T>;
}

export interface ISubscribeOnObservable<T> extends IObservable<T> { }
export interface SubscribeOnObservable<T> extends ISubscribeOnObservable<T> { }

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class SubscribeOnObservable<T> extends Observable<T> {
  static create<T>(source: IObservable<T>, delay: number = 0, scheduler: Scheduler = asap): IObservable<T> {
    return new SubscribeOnObservable(source, delay, scheduler);
  }

  static dispatch<T>(arg: DispatchArg<T>): Subscription {
    const { source, subscriber } = arg;
    return source.subscribe(subscriber);
  }

  constructor(public source: IObservable<T>,
              private delayTime: number = 0,
              private scheduler: Scheduler = asap) {
    super();
    if (!isNumeric(delayTime) || delayTime < 0) {
      this.delayTime = 0;
    }
    if (!scheduler || typeof scheduler.schedule !== 'function') {
      this.scheduler = asap;
    }
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    const delay = this.delayTime;
    const source = this.source;
    const scheduler = this.scheduler;

    return scheduler.schedule(SubscribeOnObservable.dispatch, delay, {
      source, subscriber
    });
  }
}
