import { Subject } from '../../Subject.js';
import { Subscriber, Observable, Subscription, operate } from '../../Observable.js';
import { ReplaySubject } from '../../ReplaySubject.js';
import { Observer, NextObserver } from '../../types.js';

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
export interface WebSocketSubjectConfig<T> {
  /** The url of the socket server to connect to */
  url: string;
  /** The protocol to use to connect */
  protocol?: string | Array<string>;
  /** @deprecated Will be removed in v8. Use {@link deserializer} instead. */
  resultSelector?: (e: MessageEvent) => T;
  /**
   * A serializer used to create messages from passed values before the
   * messages are sent to the server. Defaults to JSON.stringify.
   */
  serializer?: (value: T) => WebSocketMessage;
  /**
   * A deserializer used for messages arriving on the socket from the
   * server. Defaults to JSON.parse.
   */
  deserializer?: (e: MessageEvent) => T;
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

const DEFAULT_WEBSOCKET_CONFIG: WebSocketSubjectConfig<any> = {
  url: '',
  deserializer: (e: MessageEvent) => JSON.parse(e.data),
  serializer: (value: any) => JSON.stringify(value),
};

const WEBSOCKETSUBJECT_INVALID_ERROR_OBJECT =
  'WebSocketSubject.error must be called with an object with an error code, and an optional reason: { code: number, reason: string }';

export type WebSocketMessage = string | ArrayBuffer | Blob | ArrayBufferView;

export class WebSocketSubject<T> extends Subject<T> {
  private _config!: WebSocketSubjectConfig<T>;

  private _output: Subject<T>;

  private _socket: WebSocket | null = null;

  private _input: Observer<T>;

  private _source: Observable<T> | undefined = undefined;

  constructor(urlConfigOrSource: string | WebSocketSubjectConfig<T>) {
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

    this._output = new Subject<T>();
    this._input = new ReplaySubject();
  }

  private _resetState() {
    this._socket = null;
    if (!this._source) {
      this._input = new ReplaySubject();
    }
    this._output = new Subject<T>();
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
  multiplex(subMsg: () => any, unsubMsg: () => any, messageFilter: (value: T) => boolean) {
    return new Observable<T>((destination) => {
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

  private _connectSocket() {
    const { WebSocketCtor, protocol, url, binaryType } = this._config;
    const { _output } = this;

    let socket: WebSocket | null = null;
    try {
      socket = protocol ? new WebSocketCtor!(url, protocol) : new WebSocketCtor!(url);
      this._socket = socket;
      if (binaryType) {
        this._socket.binaryType = binaryType;
      }
    } catch (e) {
      _output.error(e);
      return;
    }

    socket.onopen = (evt: Event) => {
      const { _socket } = this;
      if (!_socket) {
        socket!.close();
        this._resetState();
        return;
      }
      const { openObserver } = this._config;
      if (openObserver) {
        openObserver.next(evt);
      }

      const previousInput = this._input;

      // We switch over now to passthrough all messages directly to the
      // to the socket, where previously we were queuing them up with
      // a ReplaySubject.
      this._input = new Subscriber({
        next: (x: T) => {
          if (socket!.readyState === 1) {
            try {
              const { serializer } = this._config;
              socket!.send(serializer!(x!));
            } catch (e) {
              this._input!.error(e);
            }
          }
        },
        error: (err: any) => {
          const { closingObserver } = this._config;
          if (closingObserver) {
            closingObserver.next(undefined);
          }
          if (err && err.code) {
            socket!.close(err.code, err.reason);
          } else {
            _output.error(new TypeError(WEBSOCKETSUBJECT_INVALID_ERROR_OBJECT));
          }
          this._resetState();
        },
        complete: () => {
          const { closingObserver } = this._config;
          if (closingObserver) {
            closingObserver.next(undefined);
          }
          socket!.close();
          this._resetState();
        },
      });

      // If the _input was a ReplaySubject before, when we
      // subscribe right now, it will synchronously emit all
      // of the buffered values.
      if (previousInput instanceof ReplaySubject) {
        previousInput.subscribe(this._input);
      }
    };

    socket.onerror = (e: Event) => {
      this._resetState();
      _output.error(e);
    };

    socket.onclose = (e: CloseEvent) => {
      if (socket === this._socket) {
        this._resetState();
      }
      const { closeObserver } = this._config;
      if (closeObserver) {
        closeObserver.next(e);
      }
      if (e.wasClean) {
        _output.complete();
      } else {
        _output.error(e);
      }
    };

    socket.onmessage = (e: MessageEvent) => {
      try {
        const { deserializer } = this._config;
        _output.next(deserializer!(e));
      } catch (err) {
        _output.error(err);
      }
    };
  }

  next(value: T) {
    this._input.next(value);
  }

  error(err: any) {
    this._input.error(err);
  }

  complete() {
    this._input.complete();
  }

  /** @internal */
  protected _subscribe(subscriber: Subscriber<T>): Subscription {
    const { _source } = this;
    if (_source) {
      return _source.subscribe(subscriber);
    }
    if (!this._socket) {
      this._connectSocket();
    }
    this._output.subscribe(subscriber);
    subscriber.add(() => {
      const { _socket } = this;
      if (this._output.observers.length === 0) {
        if (_socket && (_socket.readyState === 1 || _socket.readyState === 0)) {
          _socket.close();
        }
        this._resetState();
      }
    });
    return subscriber;
  }

  unsubscribe() {
    const { _socket } = this;
    if (_socket && (_socket.readyState === 1 || _socket.readyState === 0)) {
      _socket.close();
    }
    this._resetState();
    super.unsubscribe();
  }
}
