import Observable from './Observable';
import Subscription from './Subscription';
import Subject from './Subject';
export default class ConnectableObservable extends Observable {
    source: Observable;
    subject: Subject;
    subscription: Subscription;
    constructor(source: Observable, subject: Subject);
    connect(): Subscription;
}
