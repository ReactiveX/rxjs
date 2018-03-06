import { Observable, range as staticRange } from 'rxjs';

Observable.range = staticRange;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let range: typeof staticRange;
  }
}
