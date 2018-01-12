import { Observable } from '../../internal/Observable';
import { never as staticNever } from '../../internal/observable/never';

Observable.never = staticNever;

declare module '../../internal/Observable' {
  namespace Observable {
    export let never: typeof staticNever;
  }
}
