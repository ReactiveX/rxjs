import { ColdObservable } from 'rxjs/cold-observable';
import { create } from 'rxjs/create';
import {
  getObservableConstructor,
  type PlatformObserver as Observer,
  type PlatformSubscribeOptions as SubscribeOptions,
  type PlatformSubscriber as Subscriber,
} from './platform-observable.js';
import type { TestColdObservable, TestHotObservable, TestMessage, TestPlatformObservable, TestSubscriptionLog } from './types.js';
import type { VirtualTimeController } from './virtual-time.js';

interface MutableSubscriptionLog {
  subscribedFrame: number;
  unsubscribedFrame: number;
}

class ColdTestObservable<T> extends ColdObservable<T> {
  readonly kind = 'cold' as const;
  readonly messages: readonly TestMessage<T>[];
  readonly subscriptions: MutableSubscriptionLog[] = [];
  readonly #controller: VirtualTimeController;

  constructor(controller: VirtualTimeController, messages: readonly TestMessage<T>[]) {
    super(() => {});
    this.#controller = controller;
    this.messages = messages;
  }

  subscribe(observer?: Partial<Observer<T>> | ((value: T) => void) | null, options?: SubscribeOptions): void {
    const log = openSubscriptionLog(this.#controller, this.subscriptions);
    const subscriber = new IndependentTestSubscriber(observer, options?.signal, () => closeSubscriptionLog(this.#controller, log));
    const subscribedAt = this.#controller.now();
    for (const message of this.messages) {
      this.#controller.scheduleAt(() => deliverMessage(subscriber, message), subscribedAt + message.frame, { signal: subscriber.signal });
    }
  }
}

export function createColdTestObservable<T>(controller: VirtualTimeController, messages: readonly TestMessage<T>[]): TestColdObservable<T> {
  return new ColdTestObservable(controller, messages);
}

export function createHotTestObservable<T>(controller: VirtualTimeController, messages: readonly TestMessage<T>[]): TestHotObservable<T> {
  const ObservableConstructor = getObservableConstructor();

  class HotTestObservable extends ObservableConstructor<T> {
    readonly kind = 'hot' as const;
    readonly messages = messages;
    readonly subscriptions: MutableSubscriptionLog[] = [];
    readonly #observers = new Set<IndependentTestSubscriber<T>>();
    #terminal: { readonly kind: 'E'; readonly error: unknown } | { readonly kind: 'C' } | undefined;

    constructor() {
      super(() => {});
      for (const message of messages) {
        controller.scheduleAt(() => {
          switch (message.notification.kind) {
            case 'N':
              this.next(message.notification.value);
              break;
            case 'E':
              this.error(message.notification.error);
              break;
            case 'C':
              this.complete();
              break;
          }
        }, message.frame);
      }
    }

    [create] = <R>(init: (subscriber: Subscriber<R>) => void): Observable<R> => new ObservableConstructor<R>(init);

    get active(): boolean {
      return this.#terminal === undefined;
    }

    subscribe(observer?: Partial<Observer<T>> | ((value: T) => void) | null, options?: SubscribeOptions): void {
      const log = openSubscriptionLog(controller, this.subscriptions);
      const subscriber = new IndependentTestSubscriber(observer, options?.signal, () => {
        this.#observers.delete(subscriber);
        closeSubscriptionLog(controller, log);
      });

      if (this.#terminal?.kind === 'E') {
        subscriber.error(this.#terminal.error);
        return;
      }
      if (this.#terminal?.kind === 'C') {
        subscriber.complete();
        return;
      }
      if (subscriber.active) {
        this.#observers.add(subscriber);
      }
    }

    next(value: T): void {
      if (!this.active) {
        return;
      }
      for (const observer of Array.from(this.#observers)) {
        observer.next(value);
      }
    }

    error(error: unknown): void {
      if (!this.active) {
        return;
      }
      this.#terminal = { kind: 'E', error };
      for (const observer of Array.from(this.#observers)) {
        observer.error(error);
      }
      this.#observers.clear();
    }

    complete(): void {
      if (!this.active) {
        return;
      }
      this.#terminal = { kind: 'C' };
      for (const observer of Array.from(this.#observers)) {
        observer.complete();
      }
      this.#observers.clear();
    }
  }

  return new HotTestObservable();
}

export function createPlatformTestObservable<T>(
  controller: VirtualTimeController,
  messages: readonly TestMessage<T>[]
): TestPlatformObservable<T> {
  const ObservableConstructor = getObservableConstructor();
  const subscriptions: MutableSubscriptionLog[] = [];
  const observable = new ObservableConstructor<T>((subscriber) => {
    const log = openSubscriptionLog(controller, subscriptions);
    const activatedAt = controller.now();
    let closed = false;
    const close = (): void => {
      if (!closed) {
        closed = true;
        closeSubscriptionLog(controller, log);
      }
    };
    subscriber.addTeardown(close);

    for (const message of messages) {
      controller.scheduleAt(
        () => {
          if (!subscriber.active) {
            return;
          }
          switch (message.notification.kind) {
            case 'N':
              subscriber.next(message.notification.value);
              break;
            case 'E':
              subscriber.error(message.notification.error);
              close();
              break;
            case 'C':
              subscriber.complete();
              close();
              break;
          }
        },
        activatedAt + message.frame,
        { signal: subscriber.signal }
      );
    }
  });

  return Object.assign(observable, {
    kind: 'observable' as const,
    messages,
    subscriptions,
  });
}

class IndependentTestSubscriber<T> implements Subscriber<T> {
  readonly #observer: Partial<Observer<T>>;
  readonly #controller = new AbortController();
  readonly #teardowns: Array<() => void> = [];
  readonly #signal: AbortSignal;
  #closed = false;

  constructor(
    observer: Partial<Observer<T>> | ((value: T) => void) | null | undefined,
    parentSignal: AbortSignal | undefined,
    teardown: () => void
  ) {
    this.#observer = typeof observer === 'function' ? { next: observer } : observer ?? {};
    this.#teardowns.push(teardown);
    this.#signal = parentSignal ? AbortSignal.any([parentSignal, this.#controller.signal]) : this.#controller.signal;
    if (this.#signal.aborted) {
      this.#close();
    } else {
      this.#signal.addEventListener('abort', () => this.#close(), {
        once: true,
      });
    }
  }

  get active(): boolean {
    return !this.#closed && !this.#signal.aborted;
  }

  get signal(): AbortSignal {
    return this.#signal;
  }

  next(value: T): void {
    if (!this.active) {
      return;
    }
    try {
      this.#observer.next?.(value);
    } catch (error) {
      globalThis.reportError(error);
    }
  }

  error(error: unknown): void {
    if (!this.active) {
      return;
    }
    this.#controller.abort(error);
    try {
      const handler = this.#observer.error;
      if (handler) {
        handler.call(this.#observer, error);
      } else {
        globalThis.reportError(error);
      }
    } catch (observerError) {
      globalThis.reportError(observerError);
    }
  }

  complete(): void {
    if (!this.active) {
      return;
    }
    this.#controller.abort();
    try {
      this.#observer.complete?.();
    } catch (error) {
      globalThis.reportError(error);
    }
  }

  addTeardown(teardown: () => void): void {
    if (!this.active) {
      teardown();
      return;
    }
    this.#teardowns.push(teardown);
  }

  #close(): void {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    for (let index = this.#teardowns.length - 1; index >= 0; index--) {
      const teardown = this.#teardowns[index];
      teardown?.();
    }
    this.#teardowns.length = 0;
  }
}

function deliverMessage<T>(subscriber: Subscriber<T>, message: TestMessage<T>): void {
  switch (message.notification.kind) {
    case 'N':
      subscriber.next(message.notification.value);
      break;
    case 'E':
      subscriber.error(message.notification.error);
      break;
    case 'C':
      subscriber.complete();
      break;
  }
}

function openSubscriptionLog(controller: VirtualTimeController, subscriptions: MutableSubscriptionLog[]): MutableSubscriptionLog {
  const log = {
    subscribedFrame: controller.now(),
    unsubscribedFrame: Infinity,
  };
  subscriptions.push(log);
  return log;
}

function closeSubscriptionLog(controller: VirtualTimeController, log: MutableSubscriptionLog): void {
  if (log.unsubscribedFrame === Infinity) {
    log.unsubscribedFrame = controller.now();
  }
}

export function isTestSource(value: unknown): value is {
  readonly messages: readonly TestMessage<unknown>[];
} {
  return typeof value === 'object' && value !== null && Array.isArray((value as { messages?: unknown }).messages);
}

export function cloneSubscriptionLogs(logs: readonly TestSubscriptionLog[]): TestSubscriptionLog[] {
  return logs.map((log) => ({ ...log }));
}
