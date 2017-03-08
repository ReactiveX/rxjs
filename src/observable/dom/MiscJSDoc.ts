import { Subscriber } from '../../Subscriber';
import { AjaxResponse } from './AjaxObservable';
import { NextObserver } from '../../Observer';

/**
 * @see {@link ajax}
 *
 * @interface
 * @name AjaxRequest
 * @noimport true
 */
export class AjaxRequestDoc {
  /**
   * @type {string}
   */
  url: string = '';
  /**
   * @type {number}
   */
  body: any = 0;
  /**
   * @type {string}
   */
  user: string = '';
  /**
   * @type {boolean}
   */
  async: boolean = false;
  /**
   * @type {string}
   */
  method: string = '';
  /**
   * @type {Object}
   */
  headers: Object = null;
  /**
   * @type {number}
   */
  timeout: number = 0;
  /**
   * @type {string}
   */
  password: string = '';
  /**
   * @type {boolean}
   */
  hasContent: boolean = false;
  /**
   * @type {boolean}
   */
  crossDomain: boolean = false;
  /**
   * @return {XMLHttpRequest}
   */
  createXHR(): XMLHttpRequest {
    return null;
  }
  /**
   * @type {Subscriber}
   */
  progressSubscriber: Subscriber<any> = null;
  /**
   * @param {AjaxResponse} response
   * @return {T}
   */
  resultSelector<T>(response: AjaxResponse): T {
    return null;
  }
  /**
   * @type {string}
   */
  responseType: string = '';
}

/**
 * Optional configuration for `webSocket` method.
 *
 * Bear in mind that the only required property in this
 * object is `url`.
 *
 * @see {@link webSocket}
 *
 * @interface
 * @name WebSocketSubjectConfig
 * @noimport true
 */
export class WebSocketSubjectConfigDoc {
  /**
   * Url of WebSocket endpoint which we will be connecting to.
   *
   * @type {string}
   */
  url: string = '';
  /**
   * A protocol or an array of protocols with which we want to communicate
   * with server.
   *
   * @type {string|string[]}
   */
  protocol?: string | Array<string> = '';
  /**
   * A function which takes WebSocket MessageEvent and returns value which will
   * be emitted in the stream. By default it is a function that parses `data`
   * property with `JSON.parse`.
   *
   * @type {function(e: MessageEvent): T}
   */
  resultSelector?: <T>(e: MessageEvent) => T = null;
  /**
   * When WebSocket connection is opened, `next` method
   * of that object will be called. Event object injected
   * to WebSocket `onopen` callback will be passed as a
   * parameter.
   *
   * @type {NextObserver<Event>}
   */
  openObserver?: NextObserver<Event> = null;
  /**
   * When WebSocket connection is closed, `next` method
   * of that object will be called. CloseEvent object injected
   * to WebSocket `onclose` callback will be passed as a
   * parameter.
   *
   * @type {NextObserver<CloseEvent>}
   */
  closeObserver?: NextObserver<CloseEvent> = null;
  /**
   * When `complete` or `error` methods on `WebSocketSubject`
   * are called, `next` will be called on this Observer,
   * without any arguments. Note that it is called when
   * closing of socket connection is triggered, so
   * before {@link closeObserver}, which is called when
   * process of closing connection ends.
   *
   * @type {NextObserver<void>}
   */
  closingObserver?: NextObserver<void> = null;
  /**
   * `WebSocket` constructor which will be used for creating an instance.
   * You can provide polyfills, mocks or anything else you'd like,
   * as long as returned value (when called with `new`) implements `WebSocket` interface.
   *
   * @type {WebSocket constructor}
   */
  WebSocketCtor?: { new(url: string, protocol?: string|Array<string>): WebSocket } = null;

  /**
   * String specifying which binary type should be transmitted by the connection.
   * Must be either `blob` or `arraybuffer`.
   *
   * @type {string}
   */
  binaryType?: 'blob' | 'arraybuffer' = 'blob';
}
