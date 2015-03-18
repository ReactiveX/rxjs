import Observer from './observer';

export default class MapObserver extends Observer {
  constructor(projectionFn, generator, subscriptionRef) {
    this._projectionFn = projectionFn;
    Observer.call(this, generator, subscriptionRef);
  }

	next(value){
    return Observer.prototype.next.call(this, this._projectionFn(value));
  }
}