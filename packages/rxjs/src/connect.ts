import { installObservableExtension } from './util/install-observable-extension.js';
import { create } from './create.js';
import { Subject } from './subject.js';
import type { ObservedValueOf, SubjectLike } from './util/types.js';

export const connect: unique symbol = Symbol('connect');

export interface ConnectConfig<T> {
  connector: () => SubjectLike<T>;
}

declare global {
  interface Observable<T> {
    [connect]<Selected extends ObservableValue<unknown>>(
      selector: (shared: Observable<T>) => Selected,
      config?: ConnectConfig<T>
    ): Observable<ObservedValueOf<Selected>>;
  }
}

installObservableExtension({
  instance: function <T, Selected extends ObservableValue<unknown>>(
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
        selected = Observable.from(selectedValue as ObservableValue<ObservedValueOf<Selected>>);
      } catch (error) {
        subscriber.error(error);
        return;
      }

      // RxJS 7 installs the selector result before connecting the source. This
      // is what makes multiple synchronous subscriptions to `shared` observe one
      // source connection.
      try {
        selected.subscribe(
          {
            next: (value) => subscriber.next(value),
            error: (error) => subscriber.error(error),
            complete: () => subscriber.complete(),
          },
          { signal: selectorController.signal }
        );
      } catch (error) {
        subscriber.error(error);
        return;
      }

      if (!subscriber.active) {
        return;
      }

      const failConnector = (error: unknown) => {
        sourceController.abort(error);
        subscriber.error(error);
      };

      try {
        source.subscribe(
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
          { signal: sourceController.signal }
        );
      } catch (error) {
        failConnector(error);
      }
    });
  },
  name: 'connect',
  symbol: connect,
});
