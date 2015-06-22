import Observable from '../Observable';
import Observer from '../Observer';
import ArrayObservable from './ArrayObservable';

export default function fromArray(array:Array<any>) : Observable {
	return new ArrayObservable(array);
}