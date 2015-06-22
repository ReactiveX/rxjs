import Observable from '../Observable';
import Observer from '../Observer';
import Subscription from '../Subscription';
class ObserveOnObserver extends Observer {
    constructor(destination, scheduler) {
        super(destination);
        this.scheduler = scheduler;
    }
    _next(value) {
        this.scheduler.schedule(0, [this.destination, value], dispatchNext);
        return { done: false };
    }
    _throw(err) {
        this.scheduler.schedule(0, [this.destination, err], dispatchThrow);
        return { done: true };
    }
    _return(value) {
        this.scheduler.schedule(0, [this.destination, value], dispatchReturn);
        return { done: true };
    }
}
function dispatchNext([destination, value]) {
    var result = destination.next(value);
    if (result.done) {
        destination.dispose();
    }
}
function dispatchThrow([destination, err]) {
    var result = destination.throw(err);
    destination.dispose();
}
function dispatchReturn([destination, value]) {
    var result = destination.return(value);
    destination.dispose();
}
class ObserveOnObservable extends Observable {
    constructor(source, scheduler) {
        super(null);
        this.source = source;
        this.scheduler = scheduler;
    }
    subscriber(observer) {
        var observeOnObserver = new ObserveOnObserver(observer, this.scheduler);
        return Subscription.from(this.source.subscriber(observeOnObserver), observeOnObserver);
    }
}
export default function observeOn(scheduler) {
    return new ObserveOnObservable(this, scheduler);
}
