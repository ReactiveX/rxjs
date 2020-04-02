import { Observable } from './Observable';
import { Deferred } from './util/deferred';

export function asyncIteratorFrom<T>(source: Observable<T>) {
  return coroutine(source);
}

async function* coroutine<T>(source: Observable<T>) {
  const deferreds: Deferred<IteratorResult<T>>[] = [];
  const values: T[] = [];
  let hasError = false;
  let error: any = null;
  let completed = false;

  const subs = source.subscribe({
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

  try {
    while (true) {
      if (values.length > 0) {
        yield values.shift();
      } else if (completed) {
        return;
      } else if (hasError) {
        throw error;
      } else {
        const d = new Deferred<IteratorResult<T>>();
        deferreds.push(d);
        const result = await d.promise;
        if (result.done) {
          return;
        } else {
          yield result.value;
        }
      }
    }
  } catch (err) {
    throw err;
  } finally {
    subs.unsubscribe();
  }
}