///<reference path="../../typings/cheater/lib.es6.d.ts"/>
import Subscription from '../subscription/subscription';

export default class Observer<T> implements Generator<T> {
  protected generator:Generator<T>;
  protected subscription:Subscription;

  [Symbol.iterator]() {
    throw 'not implemented';
    return undefined;
  }

  [Symbol.toStringTag] = "[object RxJS.Observer]";

  constructor(generator:Generator<T>, subscriptionDisposable:Subscription) {
    this.generator = generator;
    this.subscription = subscriptionDisposable;
  }

  next(value:T):IteratorResult<T> {
    if (this.subscription.isDisposed) {
      return;
    }
    var iterationResult = this.generator.next(value);
    if(typeof iterationResult !== 'undefined' && iterationResult.done) {
      this.subscription.dispose();
    }
    return iterationResult;
  }

  throw(err:any):IteratorResult<any> {
    if (this.subscription.isDisposed) {
      return;
    }
    this.subscription.dispose();
    if(this.generator.throw) {
      return this.generator.throw(err);
    }
  }

  return(value:any):IteratorResult<any> {
    if (this.subscription.isDisposed) {
      return;
    }
    this.subscription.dispose();
    if(this.generator.return) {
      return this.generator.return(value);
    }
  }
}