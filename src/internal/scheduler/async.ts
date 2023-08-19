import { AsyncAction } from './AsyncAction';
import { AsyncScheduler } from './AsyncScheduler';

/**
 * An asynchronous scheduler that schedules tasks on the JavaScript event loop queue.
 *
 * <span class="informal">Schedules a task as if you used `setTimeout(task, duration)`.</span>
 *
 * `asyncScheduler` scheduler schedules tasks asynchronously, by putting them on the JavaScript
 * event loop queue. It is best used to delay tasks in time or to schedule tasks repeating
 * in intervals.
 *
 * If you just want to "defer" task, that is to perform it right after currently
 * executing synchronous code ends (commonly achieved by `setTimeout(deferredTask, 0)`),
 * better choice will be the {@link asapScheduler} scheduler.
 *
 * ## Examples
 * Use async scheduler to delay task
 * ```ts
 * import { asyncScheduler } from 'rxjs';
 *
 * const task = () => console.log('it works!');
 *
 * asyncScheduler.schedule(task, 2000);
 *
 * // After 2 seconds logs:
 * // "it works!"
 * ```
 *
 * Use async scheduler to repeat task in intervals
 * ```ts
 * import { asyncScheduler } from 'rxjs';
 *
 * function task(state) {
 *   console.log(state);
 *   this.schedule(state + 1, 1000); // `this` references currently executing Action,
 *                                   // which we reschedule with new state and delay
 * }
 *
 * asyncScheduler.schedule(task, 3000, 0);
 *
 * // Logs:
 * // 0 after 3s
 * // 1 after 4s
 * // 2 after 5s
 * // 3 after 6s
 * ```
 *
 * ### Known Limitation
 *
 * The {@link asyncScheduler} uses [`setTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
 * internally which has limitation for how far in the future it can be scheduled. The `delay` used by `setTimeout`
 * uses 32-bit signed integer internally. This causes an integer overflow when using delays larger than 2,147,483,647
 * ms (about 24.8 days), [resulting in the timeout being executed
 * immediately](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout#maximum_delay_value).
 */
export const asyncScheduler = new AsyncScheduler(AsyncAction);
