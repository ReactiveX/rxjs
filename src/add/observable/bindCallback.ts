import {Observable} from '../../Observable';
import {BoundCallbackObservable} from '../../observable/BoundCallbackObservable';

Observable.bindCallback = BoundCallbackObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let bindCallback: typeof BoundCallbackObservable.create;
  }
}
