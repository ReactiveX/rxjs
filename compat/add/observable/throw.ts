import { Observable, throwError as staticThrowError } from 'rxjs';

Observable.throw = staticThrowError;
Observable.throwError = staticThrowError;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let throwError: typeof staticThrowError;
  }
}
