import { Observable } from 'rxjs';
import { defer as staticDefer } from 'rxjs/observable/defer';

Observable.defer = staticDefer;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let defer: typeof staticDefer;
  }
}
