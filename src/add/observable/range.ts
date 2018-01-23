import { Observable } from '../../internal/Observable';
import { range as staticRange } from '../../internal/observable/range';

Observable.range = staticRange;

declare module '../../internal/Observable' {
  namespace Observable {
    export let range: typeof staticRange;
  }
}
