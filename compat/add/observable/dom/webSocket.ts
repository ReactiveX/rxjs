import { Observable } from 'rxjs';
import { websocket as staticWebSocket } from 'rxjs/websocket';

Observable.webSocket = staticWebSocket;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let webSocket: typeof staticWebSocket;
  }
}
