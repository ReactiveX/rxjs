import {Subject} from '../../Subject';
import {Subscriber} from '../../Subscriber';
import {Observable} from '../../Observable';
import {Operator} from '../../Operator';
import {Subscription} from '../../Subscription';
import {root} from '../../util/root';
import {ReplaySubject} from '../../ReplaySubject';
import {Observer, NextObserver} from '../../Observer';
import {tryCatch} from '../../util/tryCatch';
import {errorObject} from '../../util/errorObject';
import {assign} from '../../util/assign';

export interface WebSocketSubjectConfig {
  url: string;
  protocol?: string | Array<string>;
  resultSelector?: <T>(e: MessageEvent) => T;
  openObserver?: NextObserver<Event>;
  closeObserver?: NextObserver<CloseEvent>;
  closingObserver?: NextObserver<void>;
  WebSocketCtor?: { new(url: string, protocol?: string|Array<string>): WebSocket };
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class WebSocketSubject<T> extends Subject<T> {
  url: string;
  protocol: string|Array<string>;
  socket: WebSocket;
  openObserver: NextObserver<Event>;
  closeObserver: NextObserver<CloseEvent>;
  closingObserver: NextObserver<void>;
  WebSocketCtor: { new(url: string, protocol?: string|Array<string>): WebSocket };

  resultSelector(e: MessageEvent) {
    return JSON.parse(e.data);
  }

  /**
   * @param urlConfigOrSource
   * @return {WebSocketSubject}
   * @static true
   * @name webSocket
   * @owner Observable
   */
  static create<T>(urlConfigOrSource: string | WebSocketSubjectConfig): WebSocketSubject<T> {
    return new WebSocketSubject<T>(urlConfigOrSource);
  }

  constructor(urlConfigOrSource: string | WebSocketSubjectConfig | Observable<T>, destination?: Observer<T>) {
    if (urlConfigOrSource instanceof Observable) {
      super(destination, urlConfigOrSource);
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

  lift<R>(operator: Operator<T, R>) {
    const sock: WebSocketSubject<T> = new WebSocketSubject(this, this.destination);
    sock.operator = <any>operator;
    return sock;
  }

  // TODO: factor this out to be a proper Operator/Subscriber implementation and eliminate closures
  multiplex(subMsg: () => any, unsubMsg: () => any, messageFilter: (value: T) => boolean) {
    const self = this;
    return new Observable((observer: Observer<any>) => {
      const result = tryCatch(subMsg)();
      if (result === errorObject) {
        observer.error(errorObject.e);
      } else {
        self.next(result);
      }

      let subscription = self.subscribe(x => {
        const result = tryCatch(messageFilter)(x);
        if (result === errorObject) {
          observer.error(errorObject.e);
        } else if (result) {
          observer.next(x);
        }
      },
        err => observer.error(err),
        () => observer.complete());

      return () => {
        const result = tryCatch(unsubMsg)();
        if (result === errorObject) {
          observer.error(errorObject.e);
        } else {
          self.next(result);
        }
        subscription.unsubscribe();
      };
    });
  }

  protected _unsubscribe() {
    this.socket = null;
    this.source = null;
    this.destination = new ReplaySubject();
    this.isStopped = false;
    this.hasErrored = false;
    this.hasCompleted = false;
    this.observers = null;
    this.isUnsubscribed = false;
  }

  protected _subscribe(subscriber: Subscriber<T>) {
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

      socket.onopen = (e: Event) => {
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

      socket.onerror = (e: Event) => self.error(e);

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
    }

    return new Subscription(() => {
      subscription.unsubscribe();
      if (!this.observers || this.observers.length === 0) {
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
