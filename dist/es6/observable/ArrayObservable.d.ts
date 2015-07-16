import Observable from '../Observable';
import Subscriber from '../Subscriber';
export default class ArrayObservable extends Observable {
    array: Array<any>;
    constructor(array: Array<any>);
    subscriber(subscriber: Subscriber): void;
}
