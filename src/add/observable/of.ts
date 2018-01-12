import { Observable } from '../../internal/Observable';
import { of as staticOf } from '../../internal/observable/of';

Observable.of = staticOf;

declare module '../../internal/Observable' {
  namespace Observable {
    export let of: typeof staticOf; //formOf an iceberg!
  }
}
