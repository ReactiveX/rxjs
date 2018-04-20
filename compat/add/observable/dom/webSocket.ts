import { Observable } from 'rxjs';
import { webSocket as staticWebSocket } from 'rxjs/webSocket';

Observable.webSocket = staticWebSocket;

declare module 'rxjs/internal/Observable' {
  namespace Observable {
    export let webSocket: typeof staticWebSocket;
  }
}
