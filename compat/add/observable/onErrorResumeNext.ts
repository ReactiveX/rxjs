import { Observable, onErrorResumeNext as staticOnErrorResumeNext } from 'rxjs';

Observable.onErrorResumeNext = staticOnErrorResumeNext;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let onErrorResumeNext: typeof staticOnErrorResumeNext;
  }
}
