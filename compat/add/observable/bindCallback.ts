import { Observable, bindCallback as staticBindCallback } from 'rxjs';

Observable.bindCallback = staticBindCallback;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let bindCallback: typeof staticBindCallback;
  }
}
