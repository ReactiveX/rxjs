import { WebSocketSubject, WebSocketSubjectConfig } from './WebSocketSubject';

/**
 * Wrapper around the w3c-compatible WebSocket object provided by the browser.
 *
 * @example <caption>Wraps browser WebSocket</caption>
 *
 * import { webSocket } from 'rxjs/websocket';
 *
 * let socket$ = webSocket('ws://localhost:8081');
 *
 * socket$.subscribe(
 *   (msg) => console.log('message received: ' + msg),
 *   (err) => console.log(err),
 *   () => console.log('complete')
 * );
 *
 * socket$.next(JSON.stringify({ op: 'hello' }));
 *
 * @example <caption>Wraps WebSocket from nodejs-websocket (using node.js)</caption>
 *
 * import { webSocket } from 'rxjs/websocket';
 * import { w3cwebsocket } from 'websocket';
 *
 * let socket$ = webSocket({
 *   url: 'ws://localhost:8081',
 *   WebSocketCtor: w3cwebsocket
 * });
 *
 * socket$.subscribe(
 *   (msg) => console.log('message received: ' + msg),
 *   (err) => console.log(err),
 *   () => console.log('complete')
 * );
 *
 * socket$.next(JSON.stringify({ op: 'hello' }));
 *
 * @param {string | WebSocketSubjectConfig} urlConfigOrSource the source of the websocket as an url or a structure defining the websocket object
 * @return {WebSocketSubject}
 */
export function webSocket<T>(urlConfigOrSource: string | WebSocketSubjectConfig<T>): WebSocketSubject<T> {
  return new WebSocketSubject<T>(urlConfigOrSource);
}
