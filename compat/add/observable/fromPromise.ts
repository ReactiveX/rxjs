import { Observable } from 'rxjs';
import { fromPromise as staticFromPromise } from 'rxjs/internal/observable/fromPromise';

(Observable as any).fromPromise = staticFromPromise;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let fromPromise: typeof staticFromPromise;
  }
}
