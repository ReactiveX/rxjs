import { Observable, combineLatest as combineLatestStatic } from 'rxjs';

Observable.combineLatest = combineLatestStatic;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let combineLatest: typeof combineLatestStatic;
  }
}
