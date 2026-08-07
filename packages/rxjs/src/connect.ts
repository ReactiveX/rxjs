import { create } from './create.js';
import { Subject } from './subject.js';
import { subscribeToSource } from './util/observable-helpers.js';
import type { ObservedValueOf, SubjectLike } from './util/types.js';

export const connect: unique symbol = Symbol('connect');

export interface ConnectConfig<T> {
  connector: () => SubjectLike<T>;
}

declare global {
  interface Observable<T> {
    [connect]<Selected extends ObservableInput<unknown>>(
      selector: (shared: Observable<T>) => Selected,
      config?: ConnectConfig<T>
    ): Observable<ObservedValueOf<Selected>>;
  }
}

Observable.prototype[connect] = function <T, Selected extends ObservableInput<unknown>>(
  this: Observable<T>,
  selector: (shared: Observable<T>) => Selected,
  config?: ConnectConfig<T>
): Observable<ObservedValueOf<Selected>> {
  const source = this;
  const connector = config?.connector ?? (() => new Subject<T>());

  return source[create]<ObservedValueOf<Selected>>((subscriber) => {
    const selectorController = new AbortController();
    const sourceController = new AbortController();

    subscriber.addTeardown(() => {
      selectorController.abort(subscriber.signal.reason);
      sourceController.abort(subscriber.signal.reason);
    });

    let destination: SubjectLike<T>;
    try {
      destination = connector();
    } catch (error) {
      subscriber.error(error);
      return;
    }

    const shared = source[create]<T>((sharedSubscriber) => {
      try {
        destination.subscribe(sharedSubscriber, { signal: sharedSubscriber.signal });
      } catch (error) {
        sharedSubscriber.error(error);
      }
    });

    let selectedValue: Selected;
    try {
      selectedValue = selector(shared);
    } catch (error) {
      subscriber.error(error);
      return;
    }

    let selected: Observable<ObservedValueOf<Selected>>;
    try {
      selected = Observable.from(selectedValue as ObservableInput<ObservedValueOf<Selected>>);
    } catch (error) {
      subscriber.error(error);
      return;
    }

    // RxJS 7 installs the selector result before connecting the source. This
    // is what makes multiple synchronous subscriptions to `shared` observe one
    // source connection.
    subscribeToSource(selected, subscriber, undefined, selectorController.signal);

    if (!subscriber.active) {
      return;
    }

    const failConnector = (error: unknown) => {
      sourceController.abort(error);
      subscriber.error(error);
    };

    subscribeToSource(
      source,
      subscriber,
      {
        next: (value) => {
          try {
            destination.next(value);
          } catch (error) {
            failConnector(error);
          }
        },
        error: (error) => {
          try {
            destination.error(error);
          } catch (connectorError) {
            failConnector(connectorError);
          }
        },
        complete: () => {
          try {
            destination.complete();
          } catch (error) {
            failConnector(error);
          }
        },
      },
      sourceController.signal
    );
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `connect` form of the exact-Symbol `[connect]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[connect]` to its source.
 */
export function pipeableConnect<T, Selected extends ObservableInput<unknown>>(selector: (shared: Observable<T>) => Selected, config?: ConnectConfig<T>): (source: Observable<T>) => Observable<ObservedValueOf<Selected>>;
export function pipeableConnect(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[connect] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
