import $$observer from './util/Symbol_observer';
import Subscription from './Subscription';
import Subject from './Subject';
export default class BehaviorSubject extends Subject {
    constructor(value) {
        super(null);
        this.value = value;
    }
    [$$observer](observer) {
        this.observers.push(observer);
        var subscription = new Subscription(null, observer);
        this.next(this.value);
        return subscription;
    }
    next(value) {
        this.value = value;
        return super.next(value);
    }
}
