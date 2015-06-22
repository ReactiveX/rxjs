import Observable from '../Observable';
import Observer from '../Observer';
export default class ArrayObservable extends Observable {
    array: Array<any>;
    constructor(array: Array<any>);
    subscriber(observer: Observer): void;
}
