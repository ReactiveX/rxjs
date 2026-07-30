import { Subject } from './subject.js';
import type { SubjectLike } from './util/types.js';

export interface ConnectableConfig<T> {
  connector: () => SubjectLike<T>;
  resetOnDisconnect?: boolean;
}

export interface ConnectableConnection {
  readonly closed: boolean;
  unsubscribe(): void;
}

interface ConnectorFailure {
  readonly error: unknown;
}

interface ConnectableState<T> {
  readonly connector: () => SubjectLike<T>;
  readonly resetOnDisconnect: boolean;
  readonly bridges: Set<Subscriber<T>>;
  subject: SubjectLike<T> | null;
  connectorFailure: ConnectorFailure | null;
  connection: Connection | null;
}

class Connection implements ConnectableConnection {
  #closed = false;

  get closed(): boolean {
    return this.#closed;
  }

  constructor(readonly controller: AbortController, private readonly disconnect: (connection: Connection, reason?: unknown) => void) {}

  unsubscribe(): void {
    this.disconnect(this);
  }

  close(reason?: unknown): void {
    if (!this.#closed) {
      this.#closed = true;
      this.controller.abort(reason);
    }
  }
}

export class ConnectableObservable<T> extends Observable<T> {
  readonly source: ObservableValue<T>;
  protected readonly subjectFactory: () => SubjectLike<T>;
  readonly #state: ConnectableState<T>;

  constructor(source: ObservableValue<T>, subjectFactory: () => SubjectLike<T>);
  constructor(source: ObservableValue<T>, config?: ConnectableConfig<T>);
  constructor(source: ObservableValue<T>, configOrSubjectFactory?: ConnectableConfig<T> | (() => SubjectLike<T>)) {
    const connector =
      typeof configOrSubjectFactory === 'function' ? configOrSubjectFactory : configOrSubjectFactory?.connector ?? (() => new Subject<T>());
    const resetOnDisconnect = typeof configOrSubjectFactory === 'function' ? true : configOrSubjectFactory?.resetOnDisconnect ?? true;
    const initialSubject = connector();
    const state: ConnectableState<T> = {
      connector,
      resetOnDisconnect,
      bridges: new Set(),
      subject: initialSubject,
      connectorFailure: null,
      connection: null,
    };

    super((subscriber) => {
      state.bridges.add(subscriber);
      subscriber.addTeardown(() => state.bridges.delete(subscriber));

      let destination: SubjectLike<T>;
      try {
        destination = getSubject(state);
        destination.subscribe(subscriber, { signal: subscriber.signal });
      } catch (error) {
        subscriber.error(error);
      }
    });

    this.source = source;
    this.subjectFactory = connector;
    this.#state = state;
  }

  connect(): ConnectableConnection {
    const state = this.#state;
    const currentConnection = state.connection;
    if (currentConnection && !currentConnection.closed) {
      return currentConnection;
    }

    const destination = getSubject(state);
    const controller = new AbortController();
    const connection = new Connection(controller, (activeConnection, reason) => {
      this.#disconnect(activeConnection, reason);
    });

    // Publish the connection before source activation. Synchronous source
    // delivery may call connect reentrantly and must receive this same facade.
    state.connection = connection;

    let source: Observable<T>;
    try {
      source = Observable.from(this.source);
    } catch (error) {
      this.#failConnection(connection, destination, error);
      return connection;
    }

    try {
      source.subscribe(
        {
          next: (value) => {
            try {
              destination.next(value);
            } catch (error) {
              this.#failConnection(connection, destination, error);
            }
          },
          error: (error) => {
            this.#errorDestination(connection, destination, error);
          },
          complete: () => {
            try {
              destination.complete();
              this.#disconnect(connection);
            } catch (error) {
              this.#failConnection(connection, destination, error);
            }
          },
        },
        { signal: controller.signal }
      );
    } catch (error) {
      this.#errorDestination(connection, destination, error);
    }

    return connection;
  }

  #errorDestination(connection: Connection, destination: SubjectLike<T>, error: unknown): void {
    try {
      destination.error(error);
      this.#disconnect(connection, error);
    } catch (connectorError) {
      this.#failConnection(connection, destination, connectorError);
    }
  }

  #failConnection(connection: Connection, destination: SubjectLike<T>, error: unknown): void {
    try {
      destination.error(error);
    } catch {
      // A broken connector must not prevent direct termination of the
      // platform bridge below.
    }

    for (const bridge of Array.from(this.#state.bridges)) {
      bridge.error(error);
    }
    this.#disconnect(connection, error);
  }

  #disconnect(connection: Connection, reason?: unknown): void {
    const state = this.#state;
    if (connection.closed) {
      return;
    }

    if (state.connection === connection) {
      state.connection = null;
    }
    connection.close(reason);

    if (state.resetOnDisconnect) {
      try {
        state.subject = state.connector();
        state.connectorFailure = null;
      } catch (error) {
        state.subject = null;
        state.connectorFailure = { error };
      }
    }
  }
}

export function connectable<T>(source: ObservableValue<T>, config?: ConnectableConfig<T>): ConnectableObservable<T> {
  return new ConnectableObservable(source, config);
}

function getSubject<T>(state: ConnectableState<T>): SubjectLike<T> {
  const failure = state.connectorFailure;
  if (failure) {
    throw failure.error;
  }

  return (state.subject ??= state.connector());
}
