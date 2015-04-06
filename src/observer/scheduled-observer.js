import Observer from './observer';
import currentFrameScheduler from '../scheduler/global/current-frame';

/**
	An observer that takes a scheduler to emit values and errors on.
	@class ScheduledObserver
	@extends {Observer}
*/
export default class ScheduledObserver extends Observer {
	constructor(scheduler, generator, subscriptionDisposable) {
		this._scheduler = scheduler || currentFrameScheduler;
		Observer.call(this, generator, subscriptionDisposable);
	}

	next(value) {
		this._scheduler.schedule([this, value], this._next);
	}

	_next(scheduler, [self, value]) {
		Observer.prototype.next.call(self, value);
	}

	throw(err) {
		this._scheduler.schedule([this, err], this._throw);
	}

	_throw(scheduler, [self, err]) {
		Observer.prototype.throw.call(self, err);
	}

	return(value) {
		this._scheduler.schedule([this, value], this._return);
	}

	_return(scheduler, [self, value]) {
		Observer.prototype.return.call(self, value);
	}
}