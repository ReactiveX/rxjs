import Observer from './observer';
/**
  An observer that takes a scheduler to emit values and errors on.
  @class ScheduledObserver
  @extends {Observer}
*/
export default class ScheduledObserver extends Observer {
    constructor(observationScheduler, generator, subscriptionDisposable) {
        super(generator, subscriptionDisposable);
        this.observationScheduler = observationScheduler;
    }
    next(value) {
        var _next = super.next;
        this.observationScheduler.schedule(0, value, (scheduler, value) => {
            _next(value);
        });
        return { done: false, value: undefined };
    }
    throw(value) {
        this.observationScheduler.schedule(0, value, this._throw.bind(this));
        return { done: true, value: undefined };
    }
    _throw(scheduler, value) {
        return super.throw(value);
    }
    return(value) {
        this.observationScheduler.schedule(0, value, this._return.bind(this));
        return { done: true, value: undefined };
    }
    _return(scheduler, value) {
        return super.return(value);
    }
}
//# sourceMappingURL=scheduled-observer.js.map