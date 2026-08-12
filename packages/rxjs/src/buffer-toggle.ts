import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const bufferToggle: unique symbol = Symbol('bufferToggle');

declare global {
  interface Observable<T> {
    [bufferToggle]<Opening>(
      openings: ObservableValue<Opening>,
      closingSelector: (opening: Opening) => ObservableValue<unknown>
    ): Observable<T[]>;
  }
}

interface BufferContext<T> {
  readonly values: T[];
  readonly closingController: AbortController;
}

Observable.prototype[bufferToggle] = function <T, Opening>(
  this: Observable<T>,
  openings: ObservableValue<Opening>,
  closingSelector: (opening: Opening) => ObservableValue<unknown>
): Observable<T[]> {
  return this[create]((subscriber) => {
    let buffers: BufferContext<T>[] = [];
    const closingControllers = new Set<AbortController>();
    const openingsController = new AbortController();

    const releaseInputs = () => {
      openingsController.abort(subscriber.signal.reason);
      for (const controller of closingControllers) {
        controller.abort(subscriber.signal.reason);
      }
      closingControllers.clear();
      buffers = [];
    };

    const terminateWithError = (error: unknown) => {
      buffers = [];
      subscriber.error(error);
    };

    const emitAndRemove = (context: BufferContext<T>) => {
      const index = buffers.indexOf(context);
      if (index < 0) {
        return;
      }

      buffers.splice(index, 1);
      closingControllers.delete(context.closingController);
      context.closingController.abort();
      subscriber.next(context.values);
    };

    const openBuffer = (opening: Opening) => {
      const context: BufferContext<T> = {
        values: [],
        closingController: new AbortController(),
      };
      buffers.push(context);
      closingControllers.add(context.closingController);

      let closingValue: ObservableValue<unknown>;
      try {
        closingValue = closingSelector(opening);
      } catch (error) {
        terminateWithError(error);
        return;
      }

      let closingSource: Observable<unknown>;
      try {
        closingSource = Observable.from(closingValue);
      } catch (error) {
        terminateWithError(error);
        return;
      }

      if (!subscriber.active || !buffers.includes(context)) {
        return;
      }

      subscribeToSource(
        closingSource,
        subscriber,
        {
          next: () => emitAndRemove(context),
          error: terminateWithError,
          // Pinned RxJS 7 behavior: a closing completion does not emit or
          // remove its buffer. The source's completion flushes it instead.
          complete: () => closingControllers.delete(context.closingController),
        },
        context.closingController.signal
      );
    };

    subscriber.addTeardown(releaseInputs);

    let openingsSource: Observable<Opening>;
    try {
      openingsSource = Observable.from(openings);
    } catch (error) {
      terminateWithError(error);
      return;
    }

    // RxJS 7 activates openings before the source so synchronous openings can
    // establish (and even close) buffers before source work begins.
    subscribeToSource(
      openingsSource,
      subscriber,
      {
        next: openBuffer,
        error: terminateWithError,
        complete: () => void 0,
      },
      openingsController.signal
    );

    const sourceController = new AbortController();
    if (subscriber.active) {
      subscriber.addTeardown(() => sourceController.abort(subscriber.signal.reason));
    }

    this.subscribe(
      {
        next: (value) => {
          for (const context of buffers) {
            context.values.push(value);
          }
        },
        error: terminateWithError,
        complete: () => {
          const remaining = buffers;
          buffers = [];
          for (const context of remaining) {
            closingControllers.delete(context.closingController);
            context.closingController.abort();
            subscriber.next(context.values);
          }
          subscriber.complete();
        },
      },
      { signal: sourceController.signal }
    );

    // A synchronous openings error still precedes a source activation in
    // RxJS 7. Activate it and then cancel it immediately with the closed
    // result, rather than leaving unobserved source work alive.
    if (!subscriber.active) {
      sourceController.abort(subscriber.signal.reason);
    }
  });
};
