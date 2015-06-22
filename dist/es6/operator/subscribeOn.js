import Observable from '../Observable';
import $$observer from '../util/Symbol_observer';
import SerialSubscription from '../SerialSubscription';
class SubscribeOnObservable extends Observable {
    constructor(source, scheduler) {
        super(null);
        this.source = source;
        this.scheduler = scheduler;
    }
    [$$observer](observer) {
        var subscription = new SerialSubscription(null);
        var observerFn = Observable.prototype[$$observer]; //HACK: https://github.com/Microsoft/TypeScript/issues/3573
        this.scheduler.schedule(0, [this, observer, observerFn, subscription], dispatchSubscription);
        return subscription;
    }
}
function dispatchSubscription([observable, observer, observerFn, subscription]) {
    subscription.add(observerFn.call(observable, observer));
}
export default function subscribeOn(scheduler) {
    return new SubscribeOnObservable(this, scheduler);
}
;
