import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { MonoTypeOperatorFunction, SchedulerLike, TeardownLogic, SchedulerAction } from '../types';
import { asap as asapScheduler } from '../scheduler/asap';
import { Subscription } from '../Subscription';
import { isScheduler } from '../util/isScheduler';
import { lift } from '../util/lift';

export interface DispatchArg<T> {
  source: Observable<T>;
  subscriber: Subscriber<T>;
}

class SubscribeOnObservable<T> extends Observable<T> {
  /** @nocollapse */
  static dispatch<T>(this: SchedulerAction<T>, arg: DispatchArg<T>) {
    const { source, subscriber } = arg;
    this.add(source.subscribe(subscriber));
  }

  constructor(
    public source: Observable<T>,
    private delayTime: number = 0,
    private scheduler: SchedulerLike = asapScheduler
  ) {
    super();
    if (delayTime < 0) {
      this.delayTime = 0;
    }
    if (!isScheduler(scheduler)) {
      this.scheduler = asapScheduler;
    }
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  _subscribe(subscriber: Subscriber<T>) {
    const delay = this.delayTime;
    const source = this.source;
    const scheduler = this.scheduler;

    return scheduler.schedule<DispatchArg<any>>(SubscribeOnObservable.dispatch as any, delay, {
      source,
      subscriber,
    });
  }
}

/**
 * Asynchronously subscribes Observers to this Observable on the specified {@link SchedulerLike}.
 *
 * With `subscribeOn` you can decide what type of scheduler a specific Observable will be using when it is subscribed to.
 *
 * Schedulers control the speed and order of emissions to observers from an Observable stream.
 *
 * ![](subscribeOn.png)
 *
 * ## Example
 *
 * Given the following code:
 *
 * ```ts
 * import { of, merge } from 'rxjs';
 *
 * const a = of(1, 2, 3);
 * const b = of(4, 5, 6);
 *
 * merge(a, b).subscribe(console.log);
 *
 * // Outputs
 * // 1
 * // 2
 * // 3
 * // 4
 * // 5
 * // 6
 * ```
 *
 * Both Observable `a` and `b` will emit their values directly and synchronously once they are subscribed to.
 *
 * If we instead use the `subscribeOn` operator declaring that we want to use the {@link asyncScheduler} for values emited by Observable `a`:
 *
 * ```ts
 * import { of, merge, asyncScheduler } from 'rxjs';
 * import { subscribeOn } from 'rxjs/operators';
 *
 * const a = of(1, 2, 3).pipe(subscribeOn(asyncScheduler));
 * const b = of(4, 5, 6);
 *
 * merge(a, b).subscribe(console.log);
 *
 * // Outputs
 * // 4
 * // 5
 * // 6
 * // 1
 * // 2
 * // 3
 * ```
 *
 * The reason for this is that Observable `b` emits its values directly and synchronously like before
 * but the emissions from `a` are scheduled on the event loop because we are now using the {@link asyncScheduler} for that specific Observable.
 *
 * @param scheduler The {@link SchedulerLike} to perform subscription actions on.
 * @param delay A delay to pass to the scheduler to delay subscriptions
 * @return The source Observable modified so that its subscriptions happen on the specified {@link SchedulerLike}.
 */
export function subscribeOn<T>(scheduler: SchedulerLike, delay: number = 0): MonoTypeOperatorFunction<T> {
  return function subscribeOnOperatorFunction(source: Observable<T>): Observable<T> {
    return lift(source, new SubscribeOnOperator<T>(scheduler, delay));
  };
}

class SubscribeOnOperator<T> implements Operator<T, T> {
  constructor(private scheduler: SchedulerLike, private delay: number) {}
  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return new SubscribeOnObservable<T>(source, this.delay, this.scheduler).subscribe(subscriber);
  }
}
