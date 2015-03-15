import Observer from './observer';

export default class MapObserver extends Observer {
  constructor(projectionFn, generator, subscription) {
    this._projectionFn = projectionFn;
    super(generator, subscription);
  }

  next(value){
    return super.next(this._projectionFn(value));
  }
}