import Observer from './observer';
/**
  An observer that takes a scheduler to emit values and errors on.
  @class ScheduledObserver
  @extends {Observer}
*/
export default class ScheduledObserver extends Observer {
    constructor(observationScheduler, generator, subscriptionDisposable) {
        super(generator, subscriptionDisposable);
        this._observationScheduler = observationScheduler;
    }
    next(value) {
        this._observationScheduler.schedule(0, value, this._next.bind(this));
    }
    _next(scheduler, value) {
        super.next(value);
    }
    throw(value) {
        this._observationScheduler.schedule(0, value, this._throw.bind(this));
    }
    _throw(scheduler, value) {
        super.throw(value);
    }
    return(value) {
        this._observationScheduler.schedule(0, value, this._return.bind(this));
    }
    _return(scheduler, value) {
        super.return(value);
    }
}
//# sourceMappingURL=scheduled-observer.js.map