import { Observable } from '../../Observable';
import { onErrorResumeNextStatic } from '../../operator/onErrorResumeNext';

Observable.onErrorResumeNext = onErrorResumeNextStatic;

declare module '../../Observable' {
  namespace Observable {
    export let onErrorResumeNext: typeof onErrorResumeNextStatic;
  }
}