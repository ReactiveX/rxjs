import { ConnectableObservable, type ConnectableConnection } from './connectable.js';
import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const refCount: unique symbol = Symbol('refCount');

declare global {
  interface Observable<T> {
    [refCount](this: ConnectableObservable<T>): Observable<T>;
  }
}

interface RefCountState {
  activeRuns: number;
  connecting: boolean;
  connection: ConnectableConnection | null;
}

const states = new WeakMap<object, RefCountState>();

Observable.prototype[refCount] = function <T>(this: ConnectableObservable<T>): Observable<T> {
  if (!(this instanceof ConnectableObservable)) {
    throw new TypeError('refCount requires a ConnectableObservable');
  }

  const source = this;

  return Observable[create]<T>((subscriber) => {
    const state = getState(source);
    state.activeRuns++;
    let counted = true;

    subscriber.addTeardown(() => {
      if (!counted) {
        return;
      }
      counted = false;

      state.activeRuns--;
      if (state.activeRuns !== 0) {
        return;
      }

      states.delete(source);
      const connection = state.connection;
      state.connection = null;

      if (connection && !connection.closed) {
        connection.unsubscribe();
      } else if (state.connecting) {
        // connect() publishes its facade before source activation. If the
        // final observer leaves during synchronous delivery, a reentrant call
        // retrieves that in-flight facade so the source can be stopped now.
        const inFlightConnection = source.connect();
        if (!inFlightConnection.closed) {
          inFlightConnection.unsubscribe();
        }
      }
    });

    // The destination must be subscribed before the first source connection
    // so no synchronous source value is lost.
    subscribeToSource(source, subscriber);

    if (!subscriber.active || state.activeRuns === 0 || state.connecting) {
      return;
    }

    const currentConnection = state.connection;
    if (currentConnection && !currentConnection.closed) {
      return;
    }

    state.connection = null;
    state.connecting = true;

    let connection: ConnectableConnection;
    try {
      connection = source.connect();
    } catch (error) {
      state.connecting = false;
      subscriber.error(error);
      return;
    }
    state.connecting = false;

    if (state.activeRuns === 0) {
      if (!connection.closed) {
        connection.unsubscribe();
      }
      return;
    }

    state.connection = connection;
  });
};

function getState(source: object): RefCountState {
  let state = states.get(source);
  if (!state) {
    state = {
      activeRuns: 0,
      connecting: false,
      connection: null,
    };
    states.set(source, state);
  }
  return state;
}
