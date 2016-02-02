import {Observable} from '../../Observable';
import {ArrayObservable} from '../../observable/ArrayObservable';
import './of';

Observable.fromArray = ArrayObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let fromArray: typeof ArrayObservable.create;
  }
}