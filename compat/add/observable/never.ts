import { Observable, interval, NEVER } from 'rxjs';

export function staticNever() {
  return NEVER;
}

Observable.never = staticNever;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let never: typeof staticNever;
  }
}
