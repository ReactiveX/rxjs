import { Observable } from '../../../internal/Observable';
import { webSocket as staticWebSocket } from '../../../internal/observable/dom/webSocket';

Observable.webSocket = staticWebSocket;

declare module '../../../internal/Observable' {
  namespace Observable {
    export let webSocket: typeof staticWebSocket;
  }
}
