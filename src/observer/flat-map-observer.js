import Observer from './observer';
import CompositeSubscription from '../composite-subscription';

export default class FlatMapObserver extends Observer {
  constructor(projection, generator, subscriptionRef) {
  	this._projection = projection;
    Observer.call(this, generator, subscriptionRef);
  }

	next(value){
		var innerObservable = this._projection(value);
		var self = this;
		this._subscriptionReference.add(innerObservable.observer({
			next(value) {
				Observer.prototype.next.call(self, value);
			},
			error(err) {
				Observer.prototype.error.call(self, err);
			},
			return(value) {
				Observer.prototype.return.call(self, value);
			}
		}));

    return Observer.prototype.next.call(this, this._projection(value));
  }
}