import currentFrameScheduler from '../scheduler/global/current-frame';

export default class Observer {
  constructor(generator, subscriptionDisposable, scheduler) {
    this._generator = generator;
    this._subscriptionDisposable = subscriptionDisposable;
    this._scheduler = scheduler || currentFrameScheduler;
  }

  next(value) {
    this._scheduler.schedule([value, this], this._next)
  }

  _next(scheduler, [value, observer]) {
    if (observer._subscriptionDisposable.isDisposed) return;
    var iterationResult = observer._generator.next(value);
    if(typeof iterationResult !== 'undefined' && iterationResult.done) {
      observer._subscriptionDisposable.dispose();
    }
    return iterationResult;
  }

  throw(err) {
    this._scheduler.schedule([err, this], this._throw);
  }

  _throw(scheduler, [err, observer]) {
    if (observer._subscriptionDisposable.isDisposed) return;
    observer._subscriptionDisposable.dispose();
    if(observer._generator.throw) {
      return observer._generator.throw(err);
    }
  }

  return(value) {
    this._scheduler.schedule([value, this], this._return);
  }

  _return(scheduler, [value, observer]) {
    if (observer._subscriptionDisposable.isDisposed) return;
    observer._subscriptionDisposable.dispose();
    if(observer._generator.return) {
      return observer._generator.return(value);
    }
  }
}