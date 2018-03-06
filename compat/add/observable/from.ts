import { Observable, from as staticFrom  } from 'rxjs';

Observable.from = staticFrom;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let from: typeof staticFrom;
  }
}
