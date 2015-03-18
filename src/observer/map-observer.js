import Observer from './observer';

export default class MapObserver extends Observer {
  constructor(projection, generator, subscriptionRef) {
    this._projection = projection;
    Observer.call(this, generator, subscriptionRef);
  }

	next(value){
    return Observer.prototype.next.call(this, this._projection(value));
  }
}