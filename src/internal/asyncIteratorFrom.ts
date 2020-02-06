import { Observable } from './Observable';
import { Deferred } from './util/deferred';

export function asyncIteratorFrom<T>(source: Observable<T>): AsyncIterableIterator<T> {
  const deferreds: Deferred<IteratorResult<T>>[] = [];
  const values: T[] = [];
  let hasError = false;
  let error: any = null;
  let completed = false;

  source.subscribe({
    next: value => {
      if (deferreds.length > 0) {
        deferreds.shift()!.resolve({ value, done: false });
      } else {
        values.push(value);
      }
    },
    error: err => {
      hasError = true;
      error = err;
      while (deferreds.length > 0) {
        deferreds.shift()!.reject(err);
      }
    },
    complete: () => {
      completed = true;
      while (deferreds.length > 0) {
        deferreds.shift()!.resolve({ value: undefined, done: true });
      }
    },
  });

  return {
    next(): Promise<IteratorResult<T>> {
      if (values.length > 0) {
        return Promise.resolve({ value: values.shift()!, done: false });
      }

      if (completed) {
        return Promise.resolve({ value: undefined, done: true });
      }

      if (hasError) {
        return Promise.reject(error);
      }

      const d = new Deferred<IteratorResult<T>>();
      deferreds.push(d);
      return d.promise;
    },

    [Symbol.asyncIterator]() {
      return this;
    },
  };
}
