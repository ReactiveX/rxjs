import { Deferred } from './util/deferred';

export function eachValueFrom<T>(input: Observable<T>): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]() {
      const buffer: T[] = [];
      const deferreds: Deferred<IteratorResult<T>>[] = [];
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
            if (deferreds.length > 0) {
              deferreds.shift()!.resolve({ done: false, value });
            } else {
              buffer.push(value);
            }
          },
          error: handleError,
          complete: handleCompletion,
        },
        { signal: abortController.signal }
      );

      const result: AsyncGenerator<T> = {
        [Symbol.asyncIterator]() {
          return this;
        },
        next() {
          if (buffer.length > 0) {
            return Promise.resolve({ done: false, value: buffer.shift()! });
          }

          if (done) {
            return Promise.resolve({ done: true, value: undefined });
          }

          if (errored) {
            return Promise.reject(reason);
          }

          const deferred = new Deferred<IteratorResult<T>>();
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
