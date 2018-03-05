import { Observable } from '../../internal/Observable';
import { onErrorResumeNext as staticOnErrorResumeNext } from '../../internal/observable/onErrorResumeNext';

Observable.onErrorResumeNext = staticOnErrorResumeNext;

declare module '../../internal/Observable' {
  namespace Observable {
    export let onErrorResumeNext: typeof staticOnErrorResumeNext;
  }
}
