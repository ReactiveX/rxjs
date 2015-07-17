import $$observer from './util/Symbol_observer';
import Subject from './Subject';
export default class BehaviorSubject extends Subject {
    constructor(value) {
        super();
        this.value = value;
    }
    [$$observer](subscriber) {
        this.subscribers.push(subscriber);
        this.next(this.value);
        return subscriber;
    }
    next(value) {
        this.value = value;
        super.next(value);
    }
}
