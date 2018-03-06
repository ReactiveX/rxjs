import { Observable, throwError as staticThrowError } from 'rxjs';

(Observable as any).throw = staticThrowError;
(Observable as any).throwError = staticThrowError;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let throwError: typeof staticThrowError;
  }
}
