import { Observable } from '../../Observable';
import { GenerateRelativeTimeObservable } from '../../observable/GenerateRelativeTimeObservable';

Observable.generateRelativeTime = GenerateRelativeTimeObservable.create;

declare module '../../Observable' {
  namespace Observable {
    export let generateRelativeTime: typeof GenerateRelativeTimeObservable.create;
  }
}
