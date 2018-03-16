import { Observable, forkJoin as staticForkJoin } from 'rxjs';

Observable.forkJoin = staticForkJoin;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let forkJoin: typeof staticForkJoin;
  }
}
