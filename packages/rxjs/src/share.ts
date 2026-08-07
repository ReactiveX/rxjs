import { create } from './create.js';
import { Subject } from './subject.js';
import type { SubjectLike } from './util/types.js';

export const share: unique symbol = Symbol('share');

type ResetOnError = boolean | ((error: any) => ObservableInput<any>);
type ResetOnComplete = boolean | (() => ObservableInput<any>);
type ResetOnRefCountZero = boolean | (() => ObservableInput<any>);

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
    rule: boolean | ((...args: Args) => ObservableInput<any>),
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

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `share` form of the exact-Symbol `[share]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[share]` to its source.
 */
export function pipeableShare<T>(config?: ShareConfig<T>): (source: Observable<T>) => Observable<T>;
export function pipeableShare(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[share] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
