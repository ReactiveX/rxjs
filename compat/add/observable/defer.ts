import { Observable, defer as staticDefer } from 'rxjs';

Observable.defer = staticDefer;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let defer: typeof staticDefer;
  }
}
