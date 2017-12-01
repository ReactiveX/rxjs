import { Observable } from '../../Observable';
import { never as staticNever } from '../../internal/observable/never';

Observable.never = staticNever;

declare module '../../Observable' {
  namespace Observable {
    export let never: typeof staticNever;
  }
}
