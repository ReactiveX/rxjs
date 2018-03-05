import { Observable } from '../../internal/Observable';
import { throwError as staticThrowError } from '../../internal/observable/throwError';

(Observable as any).throw = staticThrowError;
(Observable as any).throwError = staticThrowError;

declare module '../../internal/Observable' {
  namespace Observable {
    export let throwError: typeof staticThrowError;
  }
}
