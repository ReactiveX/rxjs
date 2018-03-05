import { Observable } from '../../internal/Observable';
import { pairs as staticPairs } from '../../internal/observable/pairs';

Observable.pairs = staticPairs;

declare module '../../internal/Observable' {
  namespace Observable {
    export let pairs: typeof staticPairs;
  }
}
