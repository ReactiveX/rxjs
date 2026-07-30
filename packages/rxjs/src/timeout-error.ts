import '@rxjs/observable-polyfill';

export interface TimeoutInfo<T, M = unknown> {
  readonly lastValue: T | null;
  readonly meta: M;
  readonly seen: number;
}

export class TimeoutError<T = unknown, M = unknown> extends Error {
  constructor(public readonly info: TimeoutInfo<T, M> | null = null) {
    super('Timeout has occurred');
    this.name = 'TimeoutError';
  }
}
