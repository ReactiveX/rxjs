import { Observable } from '../../Observable';
import { onErrorResumeNext as staticOnErrorResumeNext } from '../../internal/observable/onErrorResumeNext';

Observable.onErrorResumeNext = staticOnErrorResumeNext;

declare module '../../Observable' {
  namespace Observable {
    export let onErrorResumeNext: typeof staticOnErrorResumeNext;
  }
}
