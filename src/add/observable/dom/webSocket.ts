import {Observable} from '../../../Observable';
import {WebSocketSubject} from '../../../observable/dom/WebSocketSubject';

Observable.webSocket = WebSocketSubject.create;

declare module '../../../Observable' {
  namespace Observable {
    export let webSocket: typeof WebSocketSubject.create;
  }
}