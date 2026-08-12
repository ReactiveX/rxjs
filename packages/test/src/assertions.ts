import { parseMarbles, parseSubscriptionMarbles, toSubscriptionLog } from './marble-parser.js';
import { cloneSubscriptionLogs, isTestSource } from './test-sources.js';
import type {
  MarbleValues,
  ObservableExpectation,
  RxTestAssertDeepEqual,
  RxTestAssertionInfo,
  SubscriptionExpectation,
  TestMessage,
  TestSubscriptionLog,
} from './types.js';
import type { VirtualTimeController } from './virtual-time.js';

interface ObservableAssertion<T> {
  readonly kind: 'observable';
  readonly actual: TestMessage<T>[];
  expected?: TestMessage<T>[];
  marbles?: string;
  matched: boolean;
  evaluated: boolean;
}

interface SubscriptionAssertion {
  readonly kind: 'subscriptions';
  readonly actual: readonly TestSubscriptionLog[];
  expected?: TestSubscriptionLog[];
  marbles?: string | readonly string[];
  matched: boolean;
  evaluated: boolean;
}

type PendingAssertion = ObservableAssertion<unknown> | SubscriptionAssertion;

/** Error thrown by the built-in deep-strict assertion adapter. */
export class RxTestAssertionError extends Error {
  readonly name = 'RxTestAssertionError' as const;

  constructor(readonly actual: unknown, readonly expected: unknown, readonly assertion: RxTestAssertionInfo) {
    super(`rxTest ${assertion.kind} assertion failed.`);
  }
}

export const defaultAssertDeepEqual: RxTestAssertDeepEqual = (actual, expected, info) => {
  if (!deepEqual(actual, expected)) {
    throw new RxTestAssertionError(actual, expected, info);
  }
};

export class ExpectationManager {
  readonly #controller: VirtualTimeController;
  readonly #assertDeepEqual: RxTestAssertDeepEqual;
  readonly #assertions: PendingAssertion[] = [];
  readonly #activeObservations = new Set<AbortController>();

  constructor(controller: VirtualTimeController, assertDeepEqual: RxTestAssertDeepEqual) {
    this.#controller = controller;
    this.#assertDeepEqual = assertDeepEqual;
  }

  expectObservable<T>(observable: Observable<T>, subscriptionMarbles?: string | null): ObservableExpectation<T> {
    const parsedSubscription = parseSubscriptionMarbles(subscriptionMarbles);
    const subscription = {
      ...parsedSubscription,
      subscribedFrame: parsedSubscription.subscribedFrame === Infinity ? 0 : parsedSubscription.subscribedFrame,
    };
    const assertion: ObservableAssertion<T> = {
      kind: 'observable',
      actual: [],
      matched: false,
      evaluated: false,
    };
    this.#assertions.push(assertion as ObservableAssertion<unknown>);

    if (subscription.subscribedFrame !== Infinity) {
      this.#controller.scheduleObservationAt(() => {
        const abortController = new AbortController();
        this.#trackObservation(abortController);
        observable.subscribe(
          {
            next: (value) => {
              assertion.actual.push({
                frame: this.#controller.now(),
                notification: {
                  kind: 'N',
                  value: this.#materializeValue(value, this.#controller.now()) as T,
                },
              });
            },
            error: (error) => {
              assertion.actual.push({
                frame: this.#controller.now(),
                notification: { kind: 'E', error },
              });
              abortController.abort(error);
            },
            complete: () => {
              assertion.actual.push({
                frame: this.#controller.now(),
                notification: { kind: 'C' },
              });
              abortController.abort();
            },
          },
          { signal: abortController.signal }
        );

        if (subscription.unsubscribedFrame !== Infinity) {
          this.#controller.scheduleObservationBoundaryAt(() => abortController.abort(), subscription.unsubscribedFrame);
        }
      }, subscription.subscribedFrame);
    }

    return {
      toBe: (marbles: string | readonly TestMessage<T>[], values?: MarbleValues<T>, error?: unknown): void => {
        this.#setMatcher(assertion);
        if (typeof marbles === 'string') {
          assertion.marbles = marbles;
          assertion.expected = parseMarbles(marbles, values, error).map((message) => this.#materializeExpectedMessage(message));
        } else {
          assertion.expected = marbles.map((message) => this.#materializeExpectedMessage(cloneMessage(message)));
        }
      },
      toEqual: (expected: Observable<T>): void => {
        this.#setMatcher(assertion);
        assertion.expected = [];
        if (subscription.subscribedFrame === Infinity) {
          return;
        }
        const expectedMessages = assertion.expected;
        this.#controller.scheduleObservationAt(() => {
          const abortController = new AbortController();
          this.#trackObservation(abortController);
          expected.subscribe(
            {
              next: (value) => {
                expectedMessages.push({
                  frame: this.#controller.now(),
                  notification: {
                    kind: 'N',
                    value: this.#materializeValue(value, this.#controller.now()) as T,
                  },
                });
              },
              error: (error) => {
                expectedMessages.push({
                  frame: this.#controller.now(),
                  notification: { kind: 'E', error },
                });
                abortController.abort(error);
              },
              complete: () => {
                expectedMessages.push({
                  frame: this.#controller.now(),
                  notification: { kind: 'C' },
                });
                abortController.abort();
              },
            },
            { signal: abortController.signal }
          );
          if (subscription.unsubscribedFrame !== Infinity) {
            this.#controller.scheduleObservationBoundaryAt(() => abortController.abort(), subscription.unsubscribedFrame);
          }
        }, subscription.subscribedFrame);
      },
    };
  }

  expectSubscriptions(actual: readonly TestSubscriptionLog[]): SubscriptionExpectation {
    const assertion: SubscriptionAssertion = {
      kind: 'subscriptions',
      actual,
      matched: false,
      evaluated: false,
    };
    this.#assertions.push(assertion);
    return {
      toBe: (marbles: string | readonly string[]): void => {
        this.#setMatcher(assertion);
        assertion.marbles = marbles;
        const diagrams = typeof marbles === 'string' ? [marbles] : marbles;
        assertion.expected = diagrams
          .map((diagram) => toSubscriptionLog(parseSubscriptionMarbles(diagram)))
          .filter((log) => log.subscribedFrame !== Infinity);
      },
    };
  }

  async evaluate(): Promise<void> {
    for (const assertion of this.#assertions) {
      if (assertion.evaluated) {
        continue;
      }
      if (!assertion.matched || assertion.expected === undefined) {
        throw new Error(`An rxTest ${assertion.kind} expectation was registered without a matcher.`);
      }

      let actual: unknown;
      let expected: unknown;
      if (assertion.kind === 'subscriptions') {
        actual = cloneSubscriptionLogs(assertion.actual);
        expected = assertion.expected.map((value) => ({ ...value }));
      } else {
        actual = assertion.actual.map(cloneMessage);
        expected = assertion.expected.map(cloneMessage);
      }
      await this.#assertDeepEqual(actual, expected, {
        kind: assertion.kind,
        marbles: assertion.marbles,
      });
      assertion.evaluated = true;
    }
  }

  assertNoOpenObservations(): void {
    if (this.#activeObservations.size > 0) {
      throw new Error(
        `rxTest finished with ${this.#activeObservations.size} open observation(s). ` +
          'Complete the source or provide an unsubscription marble.'
      );
    }
  }

  #setMatcher(assertion: PendingAssertion): void {
    if (assertion.matched) {
      throw new Error('An rxTest expectation can have only one matcher.');
    }
    assertion.matched = true;
  }

  #materializeExpectedMessage<T>(message: TestMessage<T>): TestMessage<T> {
    if (message.notification.kind === 'N' && isTestSource(message.notification.value)) {
      return {
        ...message,
        notification: {
          kind: 'N',
          value: message.notification.value.messages as T,
        },
      };
    }
    return message;
  }

  #materializeValue(value: unknown, outerFrame: number): unknown {
    if (isTestSource(value)) {
      return value.messages;
    }
    if (!isObservableLike(value)) {
      return value;
    }

    const messages: TestMessage<unknown>[] = [];
    const abortController = new AbortController();
    this.#trackObservation(abortController);
    value.subscribe(
      {
        next: (innerValue) => {
          messages.push({
            frame: this.#controller.now() - outerFrame,
            notification: { kind: 'N', value: innerValue },
          });
        },
        error: (error) => {
          messages.push({
            frame: this.#controller.now() - outerFrame,
            notification: { kind: 'E', error },
          });
          abortController.abort(error);
        },
        complete: () => {
          messages.push({
            frame: this.#controller.now() - outerFrame,
            notification: { kind: 'C' },
          });
          abortController.abort();
        },
      },
      { signal: abortController.signal }
    );
    return messages;
  }

  #trackObservation(controller: AbortController): void {
    this.#activeObservations.add(controller);
    controller.signal.addEventListener(
      'abort',
      () => {
        this.#activeObservations.delete(controller);
      },
      { once: true }
    );
  }
}

function cloneMessage<T>(message: TestMessage<T>): TestMessage<T> {
  return {
    frame: message.frame,
    notification: { ...message.notification },
  };
}

function isObservableLike(value: unknown): value is Observable<unknown> {
  return typeof value === 'object' && value !== null && typeof (value as { subscribe?: unknown }).subscribe === 'function';
}

function deepEqual(actual: unknown, expected: unknown, seen = new WeakMap<object, object>()): boolean {
  if (Object.is(actual, expected)) {
    return true;
  }
  if (typeof actual !== 'object' || actual === null || typeof expected !== 'object' || expected === null) {
    return false;
  }

  const seenExpected = seen.get(actual);
  if (seenExpected) {
    return seenExpected === expected;
  }
  seen.set(actual, expected);

  if (Object.getPrototypeOf(actual) !== Object.getPrototypeOf(expected)) {
    return false;
  }
  if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();
  }
  if (actual instanceof RegExp && expected instanceof RegExp) {
    return actual.source === expected.source && actual.flags === expected.flags;
  }
  if (actual instanceof Error && expected instanceof Error) {
    return actual.name === expected.name && actual.message === expected.message && deepEqual(actual.cause, expected.cause, seen);
  }
  if (ArrayBuffer.isView(actual) && ArrayBuffer.isView(expected)) {
    if (actual.byteLength !== expected.byteLength || actual.constructor !== expected.constructor) {
      return false;
    }
    const actualBytes = new Uint8Array(actual.buffer, actual.byteOffset, actual.byteLength);
    const expectedBytes = new Uint8Array(expected.buffer, expected.byteOffset, expected.byteLength);
    for (let index = 0; index < actualBytes.length; index++) {
      if (actualBytes[index] !== expectedBytes[index]) {
        return false;
      }
    }
    return true;
  }
  if (actual instanceof Map && expected instanceof Map) {
    if (actual.size !== expected.size) {
      return false;
    }
    const expectedEntries = Array.from(expected.entries());
    return Array.from(actual.entries()).every(([actualKey, actualValue]) =>
      expectedEntries.some(
        ([expectedKey, expectedValue]) => deepEqual(actualKey, expectedKey, seen) && deepEqual(actualValue, expectedValue, seen)
      )
    );
  }
  if (actual instanceof Set && expected instanceof Set) {
    if (actual.size !== expected.size) {
      return false;
    }
    const expectedValues = Array.from(expected.values());
    return Array.from(actual.values()).every((actualValue) =>
      expectedValues.some((expectedValue) => deepEqual(actualValue, expectedValue, seen))
    );
  }

  const actualKeys = Reflect.ownKeys(actual).filter((key) => Object.prototype.propertyIsEnumerable.call(actual, key));
  const expectedKeys = Reflect.ownKeys(expected).filter((key) => Object.prototype.propertyIsEnumerable.call(expected, key));
  if (actualKeys.length !== expectedKeys.length) {
    return false;
  }
  for (const key of actualKeys) {
    if (
      !expectedKeys.includes(key) ||
      !deepEqual((actual as Record<PropertyKey, unknown>)[key], (expected as Record<PropertyKey, unknown>)[key], seen)
    ) {
      return false;
    }
  }
  return true;
}
