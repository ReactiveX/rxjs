import { Observable } from '../../../Observable';
import { fromDOMObserver as staticFromDOMObserver } from '../../../observable/dom/fromDOMObserver';

Observable.fromDOMObserver = staticFromDOMObserver;

declare module '../../../Observable' {
  namespace Observable {
    export let fromDOMObserver: typeof staticFromDOMObserver;
  }
}