export interface MarbleContextOptions {
  startDate?: Date | number | string;
}

interface TimerQueueItem {
  id: number;
  callback: (...args: any[]) => void;
  delay: number;
  time: number;
  type: 'timeout' | 'interval';
  args: any[];
}

const OriginalDate = globalThis.Date;
const originalPerformanceNow = globalThis.performance.now;
const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;
const originalSetInterval = globalThis.setInterval;
const originalClearInterval = globalThis.clearInterval;

const flushMicrotasks = Promise.resolve();

export class FakeTimers {
  #timerId = 0;
  #timerQueue: TimerQueueItem[] = [];

  #shouldUseNodeTimeout = typeof globalThis.setTimeout(() => {}) === 'object';

  #setTimeout: typeof globalThis.setTimeout = (() => {
    const patched = (callback: TimerHandler, delay = 0, ...args: any[]): any => {
      const id = ++this.#timerId;
      const time = this.#now + delay;

      if (typeof callback !== 'function') {
        throw new TypeError('MarbleContext.setTimeout: callback must be a function');
      }

      const item: TimerQueueItem = { id, callback: callback as (...args: any[]) => void, delay, time, type: 'timeout', args };
      this.#addTimer(item);

      if (this.#shouldUseNodeTimeout) {
        let ref = false;
        const nodeTimeout = {
          ref: () => {
            ref = true;
            return nodeTimeout;
          },
          unref: () => {
            ref = false;
            return nodeTimeout;
          },
          hasRef: () => {
            return ref;
          },
          refresh: () => {
            item.time = this.#now + delay;
            return nodeTimeout;
          },
          [Symbol.toPrimitive]: () => id,
          [Symbol.dispose]: () => {
            this.#removeTimer(id);
          },
        } as any;

        return nodeTimeout;
      }

      return id;
    };

    patched.__promisify__ = <T = void>(delay?: number | undefined, value?: T | undefined, options?: unknown): Promise<T> => {
      return new Promise((resolve) => {
        patched(() => resolve(value!), delay ?? 0);
      });
    };

    return patched;
  })();

  #clearTimeout: typeof globalThis.clearTimeout = (id: Parameters<typeof originalClearTimeout>[0]) => {
    if (id === undefined) return;
    this.#removeTimer(+id);
  };

  #setInterval: typeof globalThis.setInterval = (() => {
    const patched = (callback: TimerHandler, delay = 0, ...args: any[]): any => {
      const id = ++this.#timerId;
      const time = this.#now + delay;
      if (typeof callback !== 'function') {
        throw new TypeError('MarbleContext.setInterval: callback must be a function');
      }
      const item: TimerQueueItem = { id, callback: callback as (...args: any[]) => void, delay, time, type: 'interval', args };
      this.#addTimer(item);

      if (this.#shouldUseNodeTimeout) {
        let ref = false;
        const nodeTimeout = {
          ref: () => {
            ref = true;
            return nodeTimeout;
          },
          unref: () => {
            ref = false;
            return nodeTimeout;
          },
          hasRef: () => {
            return ref;
          },
          refresh: () => {
            item.time = this.#now + delay;
            return nodeTimeout;
          },
          [Symbol.toPrimitive]: () => id,
          [Symbol.dispose]: () => {
            this.#removeTimer(id);
          },
        } as any;

        return nodeTimeout;
      }

      return id;
    };

    patched.__promisify__ = async function* <T = void>(
      delay?: number | undefined,
      value?: T | undefined,
      options?: unknown
    ): AsyncGenerator<T, never, unknown> {
      while (true) {
        yield value!;
        await new Promise((resolve) => patched(resolve, delay ?? 0));
      }
    };

    return patched;
  })();

  #clearInterval: typeof globalThis.clearInterval = (id: Parameters<typeof originalClearInterval>[0]) => {
    if (id === undefined) return;
    this.#removeTimer(+id);
  };

  #performanceNow = () => this.#now * 1000;

  #dateConstructor: DateConstructor = (() => {
    const context = this;

    class ContextDate extends Date {
      static name = 'Date';

      static now() {
        return context.#now;
      }

      constructor(...args: any[]) {
        if (args.length === 0) {
          super(context.#now);
        } else {
          // @ts-expect-error You can't handle me, TypeScript! I'm crazy! Unpredictable!
          super(...args);
        }
      }

      toString(): string {
        return super.toString();
      }
    }

    function PatchedDate(...args: any[]) {
      if (new.target) {
        return new ContextDate(...args);
      }

      return new ContextDate(...args).toString();
    }

    return PatchedDate as DateConstructor;
  })();

  #addTimer(item: TimerQueueItem) {
    this.#timerQueue.push(item);
    this.#timerQueue.sort((a, b) => (a.time === b.time ? a.id - b.id : a.time - b.time));
  }

  #removeTimer(id: number) {
    const index = this.#timerQueue.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.#timerQueue.splice(index, 1);
    }
  }

  async #flushTimers(until: number) {
    while (this.#timerQueue.length > 0) {
      const nextItem = this.#timerQueue[0];
      if (!nextItem || nextItem.time > until) break;
      this.#timerQueue.shift();
      this.#now = nextItem.time;
      nextItem.callback(...nextItem.args);
      if (nextItem.type === 'interval') {
        nextItem.time += nextItem.delay;
        this.#addTimer(nextItem);
      }

      await flushMicrotasks; // flush microtasks
    }
  }

  useFakeTimers() {
    globalThis.setTimeout = this.#setTimeout;
    globalThis.clearTimeout = this.#clearTimeout;

    globalThis.setInterval = this.#setInterval;
    globalThis.clearInterval = this.#clearInterval;

    globalThis.Date = this.#dateConstructor;
    globalThis.performance.now = this.#performanceNow;
  }

  useRealTimers() {
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
    globalThis.Date = OriginalDate;
    globalThis.performance.now = originalPerformanceNow;
  }

  #now = 0;

  constructor(options?: MarbleContextOptions) {
    const { startDate = 0 } = options ?? {};

    this.#now = +new OriginalDate(startDate);
  }
}
