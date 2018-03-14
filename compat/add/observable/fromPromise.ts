import { Observable, from } from 'rxjs';
import { fromPromise as staticFromPromise } from 'rxjs/internal-compatibility';

(Observable as any).fromPromise = from;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let fromPromise: typeof staticFromPromise;
  }
}
