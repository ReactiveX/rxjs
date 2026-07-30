import { Deferred } from './deferred.js';

const RESOLVED = Promise.resolve();

type TerminalState = { kind: 'complete' } | { kind: 'error'; error: unknown };

/**
 * Bridges push notifications to one-at-a-time async iteration without dropping
 * values. Values that arrive while the consumer is busy are retained in FIFO
 * order, so a producer that persistently outruns its consumer can grow this
 * queue without bound.
 */
export async function* eachValueAsyncGenerator<T>(source: Observable<T>): AsyncGenerator<T, void, void> {
  const values: T[] = [];
  let pending: Deferred<IteratorResult<T, void>> | undefined;
  let terminal: TerminalState | undefined;
  const abortController = new AbortController();

  try {
    source.subscribe(
      {
        next: (value) => {
          const deferred = pending;
          if (deferred) {
            pending = undefined;
            deferred.resolve({ done: false, value });
          } else {
            values.push(value);
          }
        },
        error: (error: unknown) => {
          terminal = { kind: 'error', error };
          pending?.reject(error);
          pending = undefined;
        },
        complete: () => {
          terminal = { kind: 'complete' };
          pending?.resolve({ done: true, value: undefined });
          pending = undefined;
        },
      },
      { signal: abortController.signal }
    );

    while (true) {
      if (values.length > 0) {
        yield values.shift()!;
        continue;
      }

      if (terminal?.kind === 'complete') {
        return;
      }

      if (terminal?.kind === 'error') {
        throw terminal.error;
      }

      pending = new Deferred<IteratorResult<T, void>>();
      const result = await pending.promise;
      if (result.done) {
        return;
      }
      yield result.value;
    }
  } finally {
    abortController.abort();
  }
}

/**
 * Bridges push notifications to lossless batches. A pending consumer is woken
 * through a microtask so every source value delivered in the same turn joins
 * the same snapshot rather than producing a series of single-value arrays.
 */
export async function* bufferedValuesAsyncGenerator<T>(source: Observable<T>): AsyncGenerator<T[], void, void> {
  const values: T[] = [];
  let pending: Deferred<IteratorResult<T[], void>> | undefined;
  let terminal: TerminalState | undefined;
  const abortController = new AbortController();

  try {
    source.subscribe(
      {
        next: (value) => {
          values.push(value);

          const deferred = pending;
          if (deferred) {
            pending = undefined;
            // Read and clear the buffer in a microtask so a synchronous burst
            // is observed as one batch.
            deferred.resolve(
              RESOLVED.then(() => ({
                done: false,
                value: values.splice(0, values.length),
              }))
            );
          }
        },
        error: (error: unknown) => {
          terminal = { kind: 'error', error };
          pending?.reject(error);
          pending = undefined;
        },
        complete: () => {
          terminal = { kind: 'complete' };
          pending?.resolve({ done: true, value: undefined });
          pending = undefined;
        },
      },
      { signal: abortController.signal }
    );

    while (true) {
      if (values.length > 0) {
        yield values.splice(0, values.length);
        continue;
      }

      if (terminal?.kind === 'complete') {
        return;
      }

      if (terminal?.kind === 'error') {
        throw terminal.error;
      }

      pending = new Deferred<IteratorResult<T[], void>>();
      const result = await pending.promise;
      if (result.done) {
        return;
      }
      yield result.value;
    }
  } finally {
    abortController.abort();
  }
}

/**
 * Bridges push notifications through one replaceable slot. A pending consumer
 * is woken through a microtask, allowing a same-turn burst to settle on its
 * latest value before the generator resumes.
 */
export async function* latestValueAsyncGenerator<T>(source: Observable<T>): AsyncGenerator<T, void, void> {
  let latest: { value: T } | undefined;
  let pending: Deferred<IteratorResult<T, void>> | undefined;
  let terminal: TerminalState | undefined;
  const abortController = new AbortController();

  try {
    source.subscribe(
      {
        next: (value) => {
          latest = { value };

          const deferred = pending;
          if (deferred) {
            pending = undefined;
            // Resolve after the current turn so later synchronous emissions
            // can replace `latest` before it is read.
            deferred.resolve(
              RESOLVED.then(() => {
                const result = latest!;
                latest = undefined;
                return { done: false, value: result.value };
              })
            );
          }
        },
        error: (error: unknown) => {
          terminal = { kind: 'error', error };
          pending?.reject(error);
          pending = undefined;
        },
        complete: () => {
          terminal = { kind: 'complete' };
          pending?.resolve({ done: true, value: undefined });
          pending = undefined;
        },
      },
      { signal: abortController.signal }
    );

    while (true) {
      if (latest) {
        await RESOLVED;
        const result = latest;
        latest = undefined;
        yield result.value;
        continue;
      }

      if (terminal?.kind === 'complete') {
        return;
      }

      if (terminal?.kind === 'error') {
        throw terminal.error;
      }

      pending = new Deferred<IteratorResult<T, void>>();
      const result = await pending.promise;
      if (result.done) {
        return;
      }
      yield result.value;
    }
  } finally {
    abortController.abort();
  }
}

/**
 * Bridges push notifications through explicit demand. Only the first value
 * received while the generator is waiting satisfies that demand; values
 * received while the consumer processes the yielded value are discarded.
 */
export async function* nextValueAsyncGenerator<T>(source: Observable<T>): AsyncGenerator<T, void, void> {
  let pending: Deferred<IteratorResult<T, void>> | undefined;
  let terminal: TerminalState | undefined;
  const abortController = new AbortController();

  try {
    source.subscribe(
      {
        next: (value) => {
          const deferred = pending;
          if (deferred) {
            pending = undefined;
            deferred.resolve({ done: false, value });
          }
        },
        error: (error: unknown) => {
          terminal = { kind: 'error', error };
          pending?.reject(error);
          pending = undefined;
        },
        complete: () => {
          terminal = { kind: 'complete' };
          pending?.resolve({ done: true, value: undefined });
          pending = undefined;
        },
      },
      { signal: abortController.signal }
    );

    while (true) {
      if (terminal?.kind === 'complete') {
        return;
      }

      if (terminal?.kind === 'error') {
        throw terminal.error;
      }

      pending = new Deferred<IteratorResult<T, void>>();
      const result = await pending.promise;
      if (result.done) {
        return;
      }
      yield result.value;
    }
  } finally {
    abortController.abort();
  }
}
