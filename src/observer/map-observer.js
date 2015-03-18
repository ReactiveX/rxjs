import Observer from './observer';

export default class MapObserver extends Observer {
  constructor(projectionFn, generator, subscriptionRef) {
    this._projectionFn = projectionFn;
    super(generator, subscriptionRef);
  }

	next(value){
    return super.next(this._projectionFn(value));
  }
}