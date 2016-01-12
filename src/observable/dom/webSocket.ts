import {Subject} from '../../Subject';
import {Subscriber} from '../../Subscriber';
import {Observable} from '../../Observable';
import {Subscription} from '../../Subscription';
import {root} from '../../util/root';
import {ReplaySubject} from '../../subject/ReplaySubject';
import {Observer} from '../../Observer';
import {tryCatch} from '../../util/tryCatch';
import {errorObject} from '../../util/errorObject';
import {Operator} from '../../Operator';
import {assign} from '../../util/assign';

export interface WebSocketSubjectConfig {
  url: string;
  protocol?: string | Array<string>;
  resultSelector?: <T>(e: MessageEvent) => T;
  openObserver?: Observer<Event>;
  closeObserver?: Observer<CloseEvent>;
  closingObserver?: Observer<void>;
  WebSocketCtor?: { new(url: string, protocol?: string|Array<string>): WebSocket };
}

export class WebSocketSubject<T> extends Subject<T> {
  url: string;
  protocol: string|Array<string>;
  socket: WebSocket;
  openObserver: Observer<Event>;
  closeObserver: Observer<CloseEvent>;
  closingObserver: Observer<void>;
  WebSocketCtor: { new(url: string, protocol?: string|Array<string>)};

  resultSelector(e: MessageEvent) {
    return JSON.parse(e.data);
  }

  static create<T>(urlConfigOrSource: string | WebSocketSubjectConfig): WebSocketSubject<T> {
    return new WebSocketSubject(urlConfigOrSource);
  }

  constructor(urlConfigOrSource: string | WebSocketSubjectConfig | Observable<T>, destination?: Observer<T>) {
    if (urlConfigOrSource instanceof Observable) {
      super(urlConfigOrSource, destination);
    } else {
      super();
      this.WebSocketCtor = root.WebSocket;

      if (typeof urlConfigOrSource === 'string') {
        this.url = urlConfigOrSource;
      } else {
        // WARNING: config object could override important members here.
        assign(this, urlConfigOrSource);
      }

      if (!this.WebSocketCtor) {
        throw new Error('no WebSocket constructor can be found');
      }

      this.destination = new ReplaySubject();
    }
  }

  lift(operator) {
    const sock = new WebSocketSubject(this, this.destination);
    sock.operator = operator;
    return sock;
  }

  multiplex(subMsg: any, unsubMsg: any, messageFilter: (value: T) => boolean) {
    return this.lift(new MultiplexOperator(this, subMsg, unsubMsg, messageFilter));
  }

  _unsubscribe() {
    this.socket = null;
    this.source = null;
    this.destination = new ReplaySubject();
    this.isStopped = false;
    this.hasErrored = false;
    this.hasCompleted = false;
    this.observers = null;
    this.isUnsubscribed = false;
  }

  _subscribe(subscriber: Subscriber<T>) {
    if (!this.observers) {
      this.observers = [];
    }

    const subscription = <Subscription>super._subscribe(subscriber);
    // HACK: For some reason transpilation wasn't honoring this in arrow functions below
    // Doesn't seem right, need to reinvestigate.
    const self = this;
    const WebSocket = this.WebSocketCtor;

    if (self.source || !subscription || (<Subscription>subscription).isUnsubscribed) {
      return subscription;
    }

    if (self.url && !self.socket) {
      const socket = self.protocol ? new WebSocket(self.url, self.protocol) : new WebSocket(self.url);
      self.socket = socket;

      socket.onopen = (e) => {
        const openObserver = self.openObserver;
        if (openObserver) {
          openObserver.next(e);
        }

        const queue = self.destination;

        self.destination = Subscriber.create(
          (x) => socket.readyState === 1 && socket.send(x),
          (e) => {
            const closingObserver = self.closingObserver;
            if (closingObserver) {
              closingObserver.next(undefined);
            }
            if (e && e.code) {
              socket.close(e.code, e.reason);
            } else {
              self._finalError(new TypeError('WebSocketSubject.error must be called with an object with an error code, ' +
                'and an optional reason: { code: number, reason: string }'));
            }
          },
          ( ) => {
            const closingObserver = self.closingObserver;
            if (closingObserver) {
              closingObserver.next(undefined);
            }
            socket.close();
          }
        );

        if (queue && queue instanceof ReplaySubject) {
          subscription.add((<ReplaySubject<T>>queue).subscribe(self.destination));
        }
      };

      socket.onerror = (e) => self.error(e);

      socket.onclose = (e: CloseEvent) => {
        const closeObserver = self.closeObserver;
        if (closeObserver) {
          closeObserver.next(e);
        }
        if (e.wasClean) {
          self._finalComplete();
        } else {
          self._finalError(e);
        }
      };

      socket.onmessage = (e: MessageEvent) => {
        const result = tryCatch(self.resultSelector)(e);
        if (result === errorObject) {
          self._finalError(errorObject.e);
        } else {
          self._finalNext(result);
        }
      };
      return subscription;
    }

    return new Subscription(() => {
      subscription.unsubscribe();
      if (this.observers.length === 0) {
        const { socket } = this;
        if (socket && socket.readyState < 2) {
          socket.close();
        }
        this.socket = undefined;
        this.source = undefined;
        this.destination = new ReplaySubject();
      }
    });
  }
}

export class MultiplexOperator<T, R> implements Operator<T, R> {
  constructor(private socketSubject: WebSocketSubject<T>,
              private subscribeMessage: any,
              private unsubscribeMessage,
              private messageFilter: (data: any) => R) {
                // noop
              }

  call(subscriber: Subscriber<R>) {
    return new MultiplexSubscriber(subscriber, this.socketSubject, this.subscribeMessage, this.unsubscribeMessage, this.messageFilter);
  }
}

export class MultiplexSubscriber<T> extends Subscriber<T> {
  constructor(destination: Observer<T>,
              private socketSubject: WebSocketSubject<any>,
              private subscribeMessage: any,
              private unsubscribeMessage: any,
              private messageFilter: (data: any) => T) {
                super(destination);

                socketSubject.next(subscribeMessage);
              }

  next(value: any) {
    const pass = tryCatch(this.messageFilter)(value);
    if (pass === errorObject) {
      this.destination.error(errorObject.e);
    } else if (pass) {
      this.destination.next(value);
    }
  }

  unsubscribe() {
    this.socketSubject.next(this.unsubscribeMessage);
    super.unsubscribe();
  }
}