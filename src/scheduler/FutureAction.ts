import {root} from '../util/root';
import {Action} from './Action';
import {Scheduler} from '../Scheduler';
import {Subscription} from '../Subscription';

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class FutureAction<T> extends Subscription implements Action<T> {

  public id: number;
  public state: T;
  public delay: number;
  public error: any;

  private pending: boolean = false;

  constructor(public scheduler: Scheduler,
              public work: (x?: T) => Subscription | void) {
    super();
  }

  execute() {
    if (this.isUnsubscribed) {
      this.error = new Error('executing a cancelled action');
    } else {
      try {
        this.work(this.state);
      } catch (e) {
        this.unsubscribe();
        this.error = e;
      }
    }
  }

  schedule(state?: T, delay: number = 0): Action<T> {
    if (this.isUnsubscribed) {
      return this;
    }
    return this._schedule(state, delay);
  }

  protected _schedule(state?: T, delay: number = 0): Action<T> {

    // Always replace the current state with the new state.
    this.state = state;

    // Set the pending flag indicating that this action has been scheduled, or
    // has recursively rescheduled itself.
    this.pending = true;

    const id = this.id;
    // If this action has an intervalID and the specified delay matches the
    // delay we used to create the intervalID, don't call `setInterval` again.
    if (id != null && this.delay === delay) {
      return this;
    }

    this.delay = delay;

    // If this action has an intervalID, but was rescheduled with a different
    // `delay` time, cancel the current intervalID and call `setInterval` with
    // the new `delay` time.
    if (id != null) {
      this.id = null;
      root.clearInterval(id);
    }

    //
    // Important implementation note:
    //
    // By default, FutureAction only executes once. However, Actions have the
    // ability to be rescheduled from within the scheduled callback (mimicking
    // recursion for asynchronous methods). This allows us to implement single
    // and repeated actions with the same code path without adding API surface
    // area, and implement tail-call optimization over asynchronous boundaries.
    //
    // However, JS runtimes make a distinction between intervals scheduled by
    // repeatedly calling `setTimeout` vs. a single `setInterval` call, with
    // the latter providing a better guarantee of precision.
    //
    // In order to accommodate both single and repeatedly rescheduled actions,
    // use `setInterval` here for both cases. By default, the interval will be
    // canceled after its first execution, or if the action schedules itself to
    // run again with a different `delay` time.
    //
    // If the action recursively schedules itself to run again with the same
    // `delay` time, the interval is not canceled, but allowed to loop again.
    // The check of whether the interval should be canceled or not is run every
    // time the interval is executed. The first time an action fails to
    // reschedule itself, the interval is canceled.
    //
    this.id = root.setInterval(() => {

      this.pending = false;
      const {id, scheduler} = this;
      scheduler.actions.push(this);
      scheduler.flush();

      //
      // Terminate this interval if the action didn't reschedule itself.
      // Don't call `this.unsubscribe()` here, because the action could be
      // rescheduled later. For example:
      //
      // ```
      // scheduler.schedule(function doWork(counter) {
      //   /* ... I'm a busy worker bee ... */
      //   var originalAction = this;
      //   /* wait 100ms before rescheduling this action again */
      //   setTimeout(function () {
      //     originalAction.schedule(counter + 1);
      //   }, 100);
      // }, 1000);
      // ```

      if (this.pending === false && id != null) {
        this.id = null;
        root.clearInterval(id);
      }
    }, delay);

    return this;
  }

  protected _unsubscribe() {

    this.pending = false;
    const {id, scheduler} = this;
    const {actions} = scheduler;
    const index = actions.indexOf(this);

    if (id != null) {
      this.id = null;
      root.clearInterval(id);
    }

    if (index !== -1) {
      actions.splice(index, 1);
    }

    this.work = null;
    this.state = null;
    this.scheduler = null;
  }
}
