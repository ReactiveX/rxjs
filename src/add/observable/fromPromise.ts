import { Observable } from '../../internal/Observable';
import { fromPromise as staticFromPromise } from '../../internal/observable/fromPromise';

Observable.fromPromise = staticFromPromise;

declare module '../../internal/Observable' {
  namespace Observable {
    export let fromPromise: typeof staticFromPromise;
  }
}
