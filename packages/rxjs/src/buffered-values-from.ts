// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
import { Deferred } from './util/deferred';

export function bufferedValuesFrom<T>(
  input: Observable<T>,
  config?: {
    minimumBufferSize?: number;
    maximumBufferSize?: number;
  }
): AsyncIterable<T[]> {
  const { minimumBufferSize = 1, maximumBufferSize = Infinity } = config ?? {};

  if (maximumBufferSize < minimumBufferSize) {
    throw new RangeError(
      `maximumBufferSize ${maximumBufferSize} cannot be less than minimumBufferSize ${minimumBufferSize}`
    );
  }

  return {
    [Symbol.asyncIterator]() {
      let buffer: T[] = [];
      const deferreds: Deferred<IteratorResult<T[]>>[] = [];
      let done = false;
      let errored = false;
      let reason: any;

      const abortController = new AbortController();

      const handleError = (error: any) => {
        errored = true;
        reason = error;
        while (deferreds.length > 0) {
          deferreds.shift()!.reject(error);
        }
      };

      const handleCompletion = () => {
        done = true;
        while (deferreds.length > 0) {
          deferreds.shift()!.resolve({ done: true, value: undefined });
        }
        return Promise.resolve({ done: true, value: undefined });
      };

      input.subscribe(
        {
          next: (value) => {
            buffer.push(value);

            if (deferreds.length > 0 && buffer.length >= minimumBufferSize) {
              const value = buffer.splice(0, maximumBufferSize);
              deferreds.shift()!.resolve({ done: false, value });
            }
          },
          error: handleError,
          complete: handleCompletion,
        },
        { signal: abortController.signal }
      );

      const result: AsyncGenerator<T[]> = {
        [Symbol.asyncIterator]() {
          return this;
        },
        next() {
          if (buffer.length >= minimumBufferSize) {
            const value = buffer.splice(0, maximumBufferSize);
            return Promise.resolve({ done: false, value });
          }

          if (done) {
            return Promise.resolve({ done: true, value: undefined });
          }

          if (errored) {
            return Promise.reject(reason);
          }

          const deferred = new Deferred<IteratorResult<T[]>>();
          deferreds.push(deferred);
          return deferred.promise;
        },
        return() {
          abortController.abort();
          handleCompletion();
          return Promise.resolve({ done: true, value: undefined });
        },
        throw(error) {
          abortController.abort();
          handleError(error);
          return Promise.reject(error);
        },
      };

      return result;
    },
  };
}
