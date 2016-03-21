import {Subscription} from '../Subscription';
import {Scheduler} from '../Scheduler';

/**
 * A unit of work to be executed in a {@link Scheduler}. An action is typically
 * created from within a Scheduler and an RxJS user does not need to concern
 * themselves about creating and manipulating an Action.
 *
 * ```ts
 * interface Action extends Subscription {
 *   work: (state?: any) => void|Subscription;
 *   state?: any;
 *   delay?: number;
 *   schedule(state?: any, delay?: number): void;
 *   execute(): void;
 *   scheduler: Scheduler;
 *   error: any;
 * }
 * ```
 *
 * @interface
 * @name Action
 * @noimport true
 */
export class ActionDoc extends Subscription {
  /**
   * The function that represents the raw work to be executed on a Scheduler.
   * @param {any} [state] Some contextual data that the `work` function uses
   * when called by the Scheduler.
   * @return {?Subscription} A subscription in order to be able to unsubscribe
   * the scheduled work.
   */
  work(state?: any): void|Subscription {
    return void 0;
  }

  /**
   * The current state. This is the object that will be given to the `work`
   * method.
   * @type {any}
   */
  state: any = void 0;

  /**
   * Represents the time (relative to the Scheduler's own clock) when this
   * action should be executed.
   * @type {number}
   */
  delay: number = 0;

  /**
   * Schedules this action on its parent Scheduler for execution. May be passed
   * some context object, `state`. May happen at some point in the future,
   * according to the `delay` parameter, if specified.
   * @param {any} [state] Some contextual data that the `work` function uses when
   * called by the Scheduler.
   * @param {number} [delay] Time to wait before executing the work, where the
   * time unit is implicit and defined by the Scheduler.
   * @return {void}
   */
  schedule(state?: any, delay?: number): void {
    return void 0;
  }

  /**
   * Immediately executes this action and the `work` it contains.
   * @return {any}
   */
  execute(): void {
    return void 0;
  }

  /**
   * The Scheduler which owns this action.
   * @type {Scheduler}
   */
  scheduler: Scheduler = null;

  /**
   * A reference to the latest error that may have occurred during action
   * execution.
   * @type {any}
   */
  error: any;
}
