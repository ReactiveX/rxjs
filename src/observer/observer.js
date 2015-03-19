export default class Observer {
  constructor(generator, subscriptionDisposable) {
    this._generator = generator;
    this._subscriptionDisposable = subscriptionDisposable;
  }

  next(value) {
    var iterationResult = this._generator.next(value);
    if(typeof iterationResult !== 'undefined' && iterationResult.done) {
      this._subscriptionDisposable.dispose();
    }
    return iterationResult;
  }

  throw(err) {
    this._subscriptionDisposable.dispose();
    var _throw = this._generator.throw;
    if(_throw) {
      return _throw.call(this, err);
    }
  }

  return(value) {
    this._subscriptionDisposable.dispose();
    var ret = this._generator.return;
    if(ret) {
      return ret.call(this, value);
    }
  }
}