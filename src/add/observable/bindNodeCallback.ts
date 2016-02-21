import {Observable} from '../../Observable';
import {BoundNodeCallbackObservable} from '../../observable/BoundNodeCallbackObservable';

Observable.bindNodeCallback = BoundNodeCallbackObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let bindNodeCallback: typeof BoundNodeCallbackObservable.create;
  }
}