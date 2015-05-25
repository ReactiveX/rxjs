import Subscription from '../subscription/subscription';
import Scheduler from '../scheduler/scheduler';
import Observer from './observer';

/**
  An observer that takes a scheduler to emit values and errors on.
  @class ScheduledObserver
  @extends {Observer}
*/
export default class ScheduledObserver<T> extends Observer<T> {
  protected observationScheduler: Scheduler;

  constructor(observationScheduler:Scheduler, generator:Generator<T>, subscriptionDisposable:Subscription) {
    super(generator, subscriptionDisposable);
    this.observationScheduler = observationScheduler;
  }

  next(value:T):IteratorResult<T> {
    var _next = super.next;
    this.observationScheduler.schedule(0, value, (scheduler:Scheduler, value:T) => {
      _next(value);
    });
    return { done: false, value: undefined };
  }

  throw(value:any):IteratorResult<any> {
    this.observationScheduler.schedule(0, value, this._throw.bind(this));
    return { done: true, value: undefined };
  }

  _throw(scheduler:Scheduler, value:any) {
    return super.throw(value);
  }

  return(value:any):IteratorResult<any> {
    this.observationScheduler.schedule(0, value, this._return.bind(this));
    return { done: true, value: undefined };
  }

  _return(scheduler:Scheduler, value:any) {
    return super.return(value);
  }
}