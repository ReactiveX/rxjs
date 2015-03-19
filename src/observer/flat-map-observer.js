import Observer from './observer';
import CompositeSubscription from '../composite-subscription';

export default class FlatMapObserver extends Observer {
  constructor(projection, generator, subscription) {
  	this._projection = projection;

    Observer.call(this, generator, subscription);
  }

	next(value){
		var innerObservable = this._projection(value);
		this._subscriptionDisposable.add(innerObservable.observer(this._generator));
  }
}