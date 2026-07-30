import { create } from './create.js';
import { Subject } from './subject.js';
import type { SubjectLike } from './util/types.js';

export const share: unique symbol = Symbol('share');

type ResetOnError = boolean | ((error: any) => ObservableValue<any>);
type ResetOnComplete = boolean | (() => ObservableValue<any>);
type ResetOnRefCountZero = boolean | (() => ObservableValue<any>);

export interface ShareConfig<T> {
  connector?: () => SubjectLike<T>;
  resetOnError?: ResetOnError;
  resetOnComplete?: ResetOnComplete;
  resetOnRefCountZero?: ResetOnRefCountZero;
}

declare global {
  interface Observable<T> {
    [share](config?: ShareConfig<T>): Observable<T>;
  }
}

Observable.prototype[share] = function <T>(this: Observable<T>, config: ShareConfig<T> = {}): Observable<T> {
  const source = this;
  const { connector = () => new Subject<T>(), resetOnError = true, resetOnComplete = true, resetOnRefCountZero = true } = config;

  let connectionController: AbortController | undefined;
  let resetController: AbortController | undefined;
  let subject: SubjectLike<T> | undefined;
  let refCount = 0;
  let hasCompleted = false;
  let hasErrored = false;

  const cancelReset = (): void => {
    const controller = resetController;
    resetController = undefined;
    controller?.abort();
  };

  const reset = (): void => {
    cancelReset();
    connectionController = undefined;
    subject = undefined;
    hasCompleted = false;
    hasErrored = false;
  };

  const resetAndDisconnect = (): void => {
    const controller = connectionController;
    reset();
    controller?.abort();
  };

  const handleReset = <Args extends unknown[]>(
    resetState: () => void,
    rule: boolean | ((...args: Args) => ObservableValue<any>),
    ...args: Args
  ): void => {
    if (rule === true) {
      resetState();
      return;
    }

    if (rule === false) {
      return;
    }

    // Match RxJS 7: reset notifier factory/conversion failures are not source
    // failures. They escape this callback to the host error-reporting path,
    // and a notifier completion without a value does not reset the share.
    const notifier = Observable.from(rule(...args));
    const controller = new AbortController();
    resetController = controller;

    notifier.subscribe(
      {
        next: () => {
          if (resetController === controller) {
            resetState();
          }
        },
      },
      { signal: controller.signal }
    );
  };

  return source[create]<T>((subscriber) => {
    refCount++;
    subscriber.addTeardown(() => {
      refCount--;
      if (refCount === 0 && !hasErrored && !hasCompleted) {
        handleReset(resetAndDisconnect, resetOnRefCountZero);
      }
    });

    if (!hasErrored && !hasCompleted) {
      cancelReset();
    }

    let destination: SubjectLike<T>;
    try {
      destination = subject ??= connector();
      destination.subscribe(subscriber, { signal: subscriber.signal });
    } catch (error) {
      subscriber.error(error);
      return;
    }

    if (!subscriber.active || connectionController || refCount === 0) {
      return;
    }

    // Publish the connection token before source activation. A synchronous
    // source value may cause a reentrant ColdObservable subscription, which
    // must join this connection instead of creating another one.
    const controller = new AbortController();
    connectionController = controller;

    try {
      source.subscribe(
        {
          next: (value) => destination.next(value),
          error: (error) => {
            hasErrored = true;
            cancelReset();
            handleReset(reset, resetOnError, error);
            destination.error(error);
          },
          complete: () => {
            hasCompleted = true;
            cancelReset();
            handleReset(reset, resetOnComplete);
            destination.complete();
          },
        },
        { signal: controller.signal }
      );
    } catch (error) {
      controller.abort(error);
      hasErrored = true;
      cancelReset();
      handleReset(reset, resetOnError, error);
      destination.error(error);
    }
  });
};
