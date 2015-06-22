import Observable from '../Observable';
import Observer from '../Observer';
import ArrayObservable from './ArrayObservable';

export default function of(...values:Array<any>) : Observable {
    return new ArrayObservable(values);
};
