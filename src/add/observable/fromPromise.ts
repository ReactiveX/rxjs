import { Observable } from '../../Observable';
import { fromPromise as staticFromPromise } from '../../internal/observable/fromPromise';

Observable.fromPromise = staticFromPromise;

declare module '../../Observable' {
  namespace Observable {
    export let fromPromise: typeof staticFromPromise;
  }
}
