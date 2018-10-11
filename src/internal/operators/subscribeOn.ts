import { SchedulerLike, FOType, SinkArg, Sink } from 'rxjs/internal/types';
import { lift } from 'rxjs/internal/util/lift';
import { Subscription } from 'rxjs/internal/Subscription';
import { Observable } from 'rxjs/internal/Observable';

/**
 * Asynchronously subscribes Observers to this Observable on the specified {@link SchedulerLike}.
 *
 * ![](subscribeOn.png)
 *
 * @param {SchedulerLike} scheduler - The {@link SchedulerLike} to perform subscription actions on.
 * @return {Observable<T>} The source Observable modified so that its subscriptions happen on the specified {@link SchedulerLike}.
 .
 * @method subscribeOn
 * @owner Observable
 */
export function subscribeOn<T>(scheduler: SchedulerLike, delay = 0) {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    scheduler.schedule(() => source(FOType.SUBSCRIBE, dest, subs), delay, undefined, subs);
  });
}
