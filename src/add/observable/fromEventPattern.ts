import { Observable } from '../../internal/Observable';
import { fromEventPattern as staticFromEventPattern } from '../../internal/observable/fromEventPattern';

Observable.fromEventPattern = staticFromEventPattern;

declare module '../../internal/Observable' {
  namespace Observable {
    export let fromEventPattern: typeof staticFromEventPattern;
  }
}
