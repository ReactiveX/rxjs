import { Observable, bindNodeCallback as staticBindNodeCallback } from 'rxjs';

Observable.bindNodeCallback = staticBindNodeCallback;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let bindNodeCallback: typeof staticBindNodeCallback;
  }
}
