import Observable from './Observable';
import { Subscription } from './Subscription';
import Subject from './Subject';
export default class ConnectableObservable extends Observable {
    source: Observable;
    subjectFactory: () => Subject;
    subscription: Subscription;
    subject: Subject;
    constructor(source: Observable, subjectFactory: () => Subject);
    connect(): Subscription;
    refCount(): Observable;
}
