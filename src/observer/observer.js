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
    if(this._generator.throw) {
      return this._generator.throw(err);
    }
  }

  return(value) {
    this._subscriptionDisposable.dispose();
    if(this._generator.return) {
      return this._generator.return(value);
    }
  }
}