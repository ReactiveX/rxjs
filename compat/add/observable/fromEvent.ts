import { Observable } from '../../internal/Observable';
import { fromEvent as staticFromEvent } from '../../internal/observable/fromEvent';

Observable.fromEvent = staticFromEvent;

declare module '../../internal/Observable' {
  namespace Observable {
    export let fromEvent: typeof staticFromEvent;
  }
}
