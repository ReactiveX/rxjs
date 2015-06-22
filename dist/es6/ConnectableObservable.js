import Observable from './Observable';
import $$observer from './util/Symbol_observer';
export default class ConnectableObservable extends Observable {
    constructor(source, subject) {
        super(null);
        this.source = source;
        this.subject = subject;
    }
    connect() {
        if (!this.subscription) {
            this.subscription = this.source.subscribe(this.subject);
        }
        return this.subscription;
    }
    [$$observer](observer) {
        return this.subject[$$observer](observer);
    }
}
