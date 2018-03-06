import { Observable, interval } from 'rxjs';
import { NEVER } from 'rxjs/internal/observable/never';

export function staticNever() {
  return NEVER;
}

Observable.never = staticNever;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let never: typeof staticNever;
  }
}
