
import {Observable, IObservable} from '../../Observable';
import {ignoreElements, IgnoreElementsSignature} from '../../operator/ignoreElements';

Observable.prototype.ignoreElements = ignoreElements;

declare module '../../Observable' {
  interface IObservable<T> {
    ignoreElements: IgnoreElementsSignature<T>;
  }
}