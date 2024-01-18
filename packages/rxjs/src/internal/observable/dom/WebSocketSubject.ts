import type { Subscriber, Subscription} from '@rxjs/observable';
import { Observable, operate } from '@rxjs/observable';
import type { NextObserver } from '../../types.js';

/**
 * WebSocketSubjectConfig is a plain Object that allows us to make our
 * webSocket configurable.
 *
 * <span class="informal">Provides flexibility to {@link webSocket}</span>
 *
 * It defines a set of properties to provide custom behavior in specific
 * moments of the socket's lifecycle. When the connection opens we can
 * use `openObserver`, when the connection is closed `closeObserver`, if we
 * are interested in listening for data coming from server: `deserializer`,
 * which allows us to customize the deserialization strategy of data before passing it
 * to the socket client. By default, `deserializer` is going to apply `JSON.parse` to each message coming
 * from the Server.
 *
 * ## Examples
 *
 * **deserializer**, the default for this property is `JSON.parse` but since there are just two options
 * for incoming data, either be text or binary data. We can apply a custom deserialization strategy
 * or just simply skip the default behaviour.
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const wsSubject = webSocket({
 *   url: 'ws://localhost:8081',
 *   //Apply any transformation of your choice.
 *   deserializer: ({ data }) => data
 * });
 *
 * wsSubject.subscribe(console.log);
 *
 * // Let's suppose we have this on the Server: ws.send('This is a msg from the server')
 * //output
 * //
 * // This is a msg from the server
 * ```
 *
 * **serializer** allows us to apply custom serialization strategy but for the outgoing messages.
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const wsSubject = webSocket({
 *   url: 'ws://localhost:8081',
 *   // Apply any transformation of your choice.
 *   serializer: msg => JSON.stringify({ channel: 'webDevelopment', msg: msg })
 * });
 *
 * wsSubject.subscribe(() => subject.next('msg to the server'));
 *
 * // Let's suppose we have this on the Server:
 * //   ws.on('message', msg => console.log);
 * //   ws.send('This is a msg from the server');
 * // output at server side:
 * //
 * // {"channel":"webDevelopment","msg":"msg to the server"}
 * ```
 *
 * **closeObserver** allows us to set a custom error when an error raises up.
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const wsSubject = webSocket({
 *   url: 'ws://localhost:8081',
 *   closeObserver: {
 *     next() {
 *       const customError = { code: 6666, reason: 'Custom evil reason' }
 *       console.log(`code: ${ customError.code }, reason: ${ customError.reason }`);
 *     }
 *   }
 * });
 *
 * // output
 * // code: 6666, reason: Custom evil reason
 * ```
 *
 * **openObserver**, Let's say we need to make some kind of init task before sending/receiving msgs to the
 * webSocket or sending notification that the connection was successful, this is when
 * openObserver is useful for.
 *
 * ```ts
 * import { webSocket } from 'rxjs/webSocket';
 *
 * const wsSubject = webSocket({
 *   url: 'ws://localhost:8081',
 *   openObserver: {
 *     next: () => {
 *       console.log('Connection ok');
 *     }
 *   }
 * });
 *
 * // output
 * // Connection ok
 * ```
 */
export interface WebSocketSubjectConfig<In, Out = In> {
  /** The url of the socket server to connect to */
  url: string;
  /** The protocol to use to connect */
  protocol?: string | Array<string>;
  /** @deprecated Will be removed in v8. Use {@link deserializer} instead. */
  resultSelector?: (e: MessageEvent) => Out;
  /**
   * A serializer used to create messages from passed values before the
   * messages are sent to the server. Defaults to JSON.stringify.
   */
  serializer?: (value: In) => WebSocketMessage;
  /**
   * A deserializer used for messages arriving on the socket from the
   * server. Defaults to JSON.parse.
   */
  deserializer?: (e: MessageEvent) => Out;
  /**
   * An Observer that watches when open events occur on the underlying web socket.
   */
  openObserver?: NextObserver<Event>;
  /**
   * An Observer that watches when close events occur on the underlying web socket
   */
  closeObserver?: NextObserver<CloseEvent>;
  /**
   * An Observer that watches when a close is about to occur due to
   * unsubscription.
   */
  closingObserver?: NextObserver<void>;
  /**
   * A WebSocket constructor to use. This is useful for situations like using a
   * WebSocket impl in Node (WebSocket is a DOM API), or for mocking a WebSocket
   * for testing purposes
   */
  WebSocketCtor?: { new (url: string, protocols?: string | string[]): WebSocket };
  /** Sets the `binaryType` property of the underlying WebSocket. */
  binaryType?: 'blob' | 'arraybuffer';
}

const DEFAULT_WEBSOCKET_CONFIG = {
  deserializer: (e: MessageEvent) => JSON.parse(e.data),
  serializer: (value: any) => JSON.stringify(value),
};

const WEBSOCKETSUBJECT_INVALID_ERROR_OBJECT =
  'WebSocketSubject.error must be called with an object with an error code, and an optional reason: { code: number, reason: string }';

export type WebSocketMessage = string | ArrayBuffer | Blob | ArrayBufferView;

export class WebSocketSubject<In, Out = In> extends Observable<Out> {
  private _config: WebSocketSubjectConfig<In, Out> &
    Required<Pick<WebSocketSubjectConfig<In, Out>, 'WebSocketCtor' | 'serializer' | 'deserializer'>>;

  private _socket: WebSocket | null = null;

  private _inputBuffer: In[] = [];

  private _hasError = false;

  private _error: any;

  private _isComplete = false;

  private _subscriberCounter = 0;

  private _subscribers = new Map<number, Subscriber<Out>>();

  get observed() {
    return this._subscribers.size > 0;
  }

  constructor(urlConfigOrSource: string | WebSocketSubjectConfig<In, Out>) {
    super();
    const userConfig = typeof urlConfigOrSource === 'string' ? { url: urlConfigOrSource } : urlConfigOrSource;
    this._config = {
      ...DEFAULT_WEBSOCKET_CONFIG,
      // Setting this here because a previous version of this allowed
      // WebSocket to be polyfilled later than DEFAULT_WEBSOCKET_CONFIG
      // was defined.
      WebSocketCtor: WebSocket,
      ...userConfig,
    };

    if (!this._config.WebSocketCtor) {
      throw new Error('no WebSocket constructor can be found');
    }
  }

  private _resetState() {
    this._socket = null;
    this._subscriberCounter = 0;
    this._subscribers.clear();
    this._inputBuffer = [];
    this._hasError = false;
    this._isComplete = false;
    this._error = null;
  }

  /**
   * Creates an {@link Observable}, that when subscribed to, sends a message,
   * defined by the `subMsg` function, to the server over the socket to begin a
   * subscription to data over that socket. Once data arrives, the
   * `messageFilter` argument will be used to select the appropriate data for
   * the resulting Observable. When finalization occurs, either due to
   * unsubscription, completion, or error, a message defined by the `unsubMsg`
   * argument will be sent to the server over the WebSocketSubject.
   *
   * @param subMsg A function to generate the subscription message to be sent to
   * the server. This will still be processed by the serializer in the
   * WebSocketSubject's config. (Which defaults to JSON serialization)
   * @param unsubMsg A function to generate the unsubscription message to be
   * sent to the server at finalization. This will still be processed by the
   * serializer in the WebSocketSubject's config.
   * @param messageFilter A predicate for selecting the appropriate messages
   * from the server for the output stream.
   */
  multiplex(subMsg: () => In, unsubMsg: () => In, messageFilter: (value: Out) => boolean) {
    return new Observable<Out>((destination) => {
      this.next(subMsg());
      destination.add(() => {
        this.next(unsubMsg());
      });
      this.subscribe(
        operate({
          destination,
          next: (x) => {
            if (messageFilter(x)) {
              destination.next(x);
            }
          },
        })
      );
    });
  }

  #outputNext(value: Out) {
    for (const subscriber of Array.from(this._subscribers.values())) {
      subscriber.next(value);
    }
  }

  #outputError(err: any) {
    const subscribers = Array.from(this._subscribers.values());
    for (const subscriber of subscribers) {
      subscriber.error(err);
    }
  }

  #outputComplete() {
    const subscribers = Array.from(this._subscribers.values());
    for (const subscriber of subscribers) {
      subscriber.complete();
    }
  }

  private _connectSocket() {
    const { WebSocketCtor, protocol, url, binaryType, deserializer, openObserver, closeObserver } = this._config;

    let socket: WebSocket | null = null;
    try {
      socket = protocol ? new WebSocketCtor(url, protocol) : new WebSocketCtor(url);
      this._socket = socket;
      if (binaryType) {
        this._socket.binaryType = binaryType;
      }
    } catch (err) {
      this.#outputError(err);
      return;
    }

    socket.onopen = (evt) => {
      if (socket !== this._socket) {
        socket?.close();
        return;
      }

      openObserver?.next(evt);

      while (this._inputBuffer.length > 0) {
        this.next(this._inputBuffer.shift()!);
      }

      if (this._hasError) {
        this.error(this._error);
      } else if (this._isComplete) {
        this.complete();
      }
    };

    socket.onerror = (e: Event) => {
      if (socket !== this._socket) {
        return;
      }

      this.#outputError(e);
    };

    socket.onclose = (e: CloseEvent) => {
      if (socket !== this._socket) {
        return;
      }

      closeObserver?.next(e);

      if (e.wasClean) {
        this.#outputComplete();
      } else {
        this.#outputError(e);
      }
    };

    socket.onmessage = (e: MessageEvent) => {
      try {
        this.#outputNext(deserializer(e));
      } catch (err) {
        this.#outputError(err);
      }
    };
  }

  next(value: In) {
    if (this._socket?.readyState !== 1) {
      this._inputBuffer.push(value);
    } else {
      try {
        this._socket.send(this._config.serializer(value));
      } catch (err: any) {
        this.error(err);
      }
    }
  }

  error(err: any) {
    if (this._socket?.readyState === 1) {
      this._config.closingObserver?.next(undefined);
      if (err?.code) {
        this._socket?.close(err.code, err.reason);
      } else {
        this.#outputError(new TypeError(WEBSOCKETSUBJECT_INVALID_ERROR_OBJECT));
      }
      this._resetState();
    } else {
      this._hasError = true;
      this._error = err;
    }
  }

  complete() {
    if (this._socket?.readyState === 1) {
      this.#closeSocket();
    } else {
      this._isComplete = true;
    }
  }

  #closeSocket() {
    const { _socket } = this;
    this._config.closingObserver?.next(undefined);
    if (_socket && _socket.readyState <= 1) {
      _socket.close();
    }
    this._resetState();
  }

  /** @internal */
  protected _subscribe(subscriber: Subscriber<Out>): Subscription {
    if (!this._socket) {
      this._connectSocket();
    }
    const subscriberId = this._subscriberCounter++;
    this._subscribers.set(subscriberId, subscriber);
    subscriber.add(() => {
      this._subscribers.delete(subscriberId);
      if (!this.observed) {
        this.#closeSocket();
      }
    });
    return subscriber;
  }

  unsubscribe() {
    const subscribers = Array.from(this._subscribers.values());
    this._subscribers.clear();
    for (const subscriber of subscribers) {
      subscriber.unsubscribe();
    }
    this._resetState();
  }
}
