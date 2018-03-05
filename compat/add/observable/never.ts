import { Observable } from '../../internal/Observable';
import { NEVER } from '../../internal/observable/never';

export function staticNever() {
  return NEVER;
}

Observable.never = staticNever;

declare module '../../internal/Observable' {
  namespace Observable {
    export let never: typeof staticNever;
  }
}
