import '@rxjs/observable-polyfill';

export class ScheduledObservable<T> extends Observable<T> {
  #subscriber: Subscriber<T> | null = null;

  #preSubsscriptionQueue: (
    | { kind: 'N'; value: T; delay: number }
    | { kind: 'E'; error: any; delay: number }
    | { kind: 'C'; delay: number }
  )[] = [];

  #currentDelay = 0;

  constructor() {
    super((subscriber) => {
      this.#subscriber = subscriber;
      const queue = Array.from(this.#preSubsscriptionQueue);
      this.#preSubsscriptionQueue = [];

      for (const item of queue) {
        const id = globalThis.setTimeout(() => {
          switch (item.kind) {
            case 'N':
              subscriber.next(item.value);
              break;
            case 'E':
              subscriber.error(item.error);
              break;
            case 'C':
              subscriber.complete();
              break;
          }
        }, item.delay);

        subscriber.addTeardown(() => globalThis.clearTimeout(id));
      }
    });
  }

  wait(delay: number | TimeString): void {
    this.#currentDelay += timeToMilliseconds(delay);
  }

  next(value: T): void {
    if (this.#subscriber) {
      this.#subscriber.next(value);
    } else {
      this.#preSubsscriptionQueue.push({ kind: 'N', value, delay: this.#currentDelay });
    }
  }

  error(error: any): void {
    if (this.#subscriber) {
      this.#subscriber.error(error);
    } else {
      this.#preSubsscriptionQueue.push({ kind: 'E', error, delay: this.#currentDelay });
    }
  }

  complete(): void {
    if (this.#subscriber) {
      this.#subscriber.complete();
    } else {
      this.#preSubsscriptionQueue.push({ kind: 'C', delay: this.#currentDelay });
    }
  }
}

export type TimeString = `${number}${'s' | 'ms' | 'min' | 'hr' | 'd'}`;

function timeToMilliseconds(time: string | number | undefined | null) {
  if (time == null) {
    return 0;
  }

  if (typeof time === 'number') {
    return time;
  }

  assertTimeFormat(time);
  const value = parseInt(time.slice(0, -1), 10);

  switch (time.slice(-1)) {
    case 's':
      return value * 1000;
    case 'ms':
      return value;
    case 'min':
      return value * 60 * 1000;
    case 'hr':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new TypeError(`Invalid time format: ${time}`);
  }
}

function assertTimeFormat(time: string): asserts time is TimeString {
  if (!/^\d+(s|ms|min|hr|d)$/.test(time)) {
    throw new Error(`Invalid time format: ${time}`);
  }
}
