import Observable from '../Observable';
import ArrayObservable from './ArrayObservable';

export default function fromArray(array:Array<any>) : Observable {
  return new ArrayObservable(array);
}