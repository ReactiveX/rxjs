import { Observable } from '../../internal/Observable';
import { defer as staticDefer } from '../../internal/observable/defer';

Observable.defer = staticDefer;

declare module '../../internal/Observable' {
  namespace Observable {
    export let defer: typeof staticDefer;
  }
}
