import { Observable, pairs as staticPairs } from 'rxjs';

Observable.pairs = staticPairs;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let pairs: typeof staticPairs;
  }
}
