import { FObs, FOArg, FOType, FSub, FSubType, Teardown,
  Subscriber, SubscriptionLike, PartialObserver, Operation } from '../types';
import { createSubscription } from '../util/createSubscription';
import { hostReportError } from '../util/hostReportError';
import { pipe } from '../util/pipe';
import { toObservable } from '../util/convert';
import { rxFSub, rxFObs } from '../util/symbols';
import { noop } from '../util/noop';

export class Observable<T> {
  constructor(init?: (subscriber: Subscriber<T>) => Teardown) {
    this[rxFObs] = init ? initToFObs(init) : noop;
  }

  subscribe(
    nextOrObserver?: PartialObserver<T> | ((value: T, subscription?: SubscriptionLike) => void),
    errorHandler?: (err: any) => void,
    completeHandler?: () => void,
  ): SubscriptionLike {
    let sink: FObs<T>;
    const subs = createSubscription();

    if (nextOrObserver) {
      if (typeof nextOrObserver === 'function') {
        sink = handlersToFObs(nextOrObserver, errorHandler, completeHandler);
      } else if (typeof nextOrObserver === 'object') {
        sink = partialObserverToFObs(nextOrObserver);
      }
    } else {
      sink = () => {/* empty sink */}; // TODO: this probably isn't right.
    }

    this[rxFObs](FOType.SUBSCRIBE, sink, subs);

    return fSubToSubscription(subs);
  }

  pipe(...fns: Array<Operation<any, any>>): Observable<any> {
    return toObservable(pipe(...fns)(this[rxFObs]));
  }
}

/** @internal */
export class FObservable<T> extends Observable<T> {
  constructor(fobs: FObs<T>) {
    super();
    this[rxFObs] = fobs;
  }
}

// TODO: handle unhandled errors.
function partialObserverToFObs<T>(partialObserver: PartialObserver<T>): FObs<T> {
  return (type: FOType, v: FOArg<T>, subs: FSub) => {
    switch (type) {
      case FOType.NEXT:
        if (partialObserver.next) {
          partialObserver.next(v, fSubToSubscription(subs));
        }
        break;
      case FOType.ERROR:
        if (!partialObserver.error) {
          hostReportError(v);
        }
        if (partialObserver.error) {
          partialObserver.error(v);
        }
        break;
      case FOType.COMPLETE:
        if (partialObserver.complete) {
          partialObserver.complete();
        }
        break;
    }
  };
}

function handlersToFObs<T>(
  nextHandler: ((value: T, subscription?: SubscriptionLike) => void) | void,
  errorHandler: ((err: any) => void) | void,
  completeHandler: (() => void) | void,
): FObs<T> {
  return (type: FOType, v: FOArg<T>, subs: FSub) => {
    switch (type) {
      case FOType.NEXT:
        if (nextHandler) {
          nextHandler(v, fSubToSubscription(subs));
        }
        break;
      case FOType.ERROR:
        if (errorHandler) {
          errorHandler(v);
        }
        break;
      case FOType.COMPLETE:
        if (completeHandler) {
          completeHandler();
        }
        break;
    }
  };
}

function fObsToSubscriber<T>(sink: FObs<T>): Subscriber<T> {
  const _subs = createSubscription();
  return new FSubscriber(_subs, sink);
}

class FSubscriber<T> implements Subscriber<T> {
  private _closed = false;

  constructor(private _subs: FSub, private _sink: FObs<T>) {
    _subs(FSubType.ADD, () => this._closed = true);
  }

  next(value: T) {
    if (!this._closed) {
      const { _subs, _sink } = this;
      _sink(FOType.NEXT, value, _subs);
    }
  }

  error(err: any) {
    if (!this._closed) {
      const { _subs, _sink } = this;
      this._closed = true;
      _sink(FOType.ERROR, err, _subs);
      _subs();
    }
  }

  complete() {
    if (!this._closed) {
      const { _subs, _sink } = this;
      this._closed = true;
      _sink(FOType.COMPLETE, undefined, _subs);
      _subs();
    }
  }

  get closed() {
    return this._closed;
  }

  [rxFSub]() {
    return this._subs;
  }
}

function fSubToSubscription(subs: FSub): SubscriptionLike {
  return {
    unsubscribe() {
      subs();
    }
  };
}

function initToFObs<T>(init: (subscriber: Subscriber<T>) => Teardown): FObs<T> {
  return (type: FOType, sink: FOArg<T>, subs: FSub) => {
    if (type === FOType.SUBSCRIBE) {
      const teardown = init(fObsToSubscriber(sink));
      subs(FSubType.ADD, () => {
        if (teardown) {
          if (typeof teardown === 'function') {
            teardown();
          } else if (typeof teardown.unsubscribe === 'function') {
            teardown.unsubscribe();
          }
        }
      });
    }
  };
}
