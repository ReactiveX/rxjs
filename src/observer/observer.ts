import Disposable from '../subscription/disposable';

export default class Observer {
  protected _generator:Generator<any>
  protected _subscriptionDisposable:Disposable

  constructor(generator, subscriptionDisposable) {
    this._generator = generator;
    this._subscriptionDisposable = subscriptionDisposable;
  }

  next(value:any) {
    if (this._subscriptionDisposable.isDisposed) {
      return;
    }
    var iterationResult = this._generator.next(value);
    if(typeof iterationResult !== 'undefined' && iterationResult.done) {
      this._subscriptionDisposable.dispose();
    }
    return iterationResult;
  }

  throw(err:Error|String) {
    if (this._subscriptionDisposable.isDisposed) {
      return;
    }
    this._subscriptionDisposable.dispose();
    if(this._generator.throw) {
      return this._generator.throw(err);
    }
  }

  return(value:any) {
    if (this._subscriptionDisposable.isDisposed) {
      return;
    }
    this._subscriptionDisposable.dispose();
    if(this._generator.return) {
      return this._generator.return(value);
    }
  }
}