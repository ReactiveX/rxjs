import { defaultAssertDeepEqual } from './assertions.js';
import { RxTestContextImplementation } from './context.js';
import { durationToMilliseconds } from './marble-parser.js';
import { getObservableConstructor } from './platform-observable.js';
import type { RxTestCallback, RxTestConfig } from './types.js';
import { VirtualTimeController } from './virtual-time.js';

interface RealmLock {
  tail: Promise<void>;
  callbackDepth: number;
  pending: number;
}

const realmLockKey = Symbol.for('@rxjs/test/realm-lock/v1');

/**
 * Runs an RxJS test with native scheduling APIs redirected to deterministic
 * virtual time for the callback's complete async lifetime.
 *
 * The returned Promise resolves only after the callback, finite virtual work,
 * and registered expectations have completed and the realm has been restored.
 */
export function rxTest(callback: RxTestCallback, config: RxTestConfig = {}): Promise<void> {
  if (typeof callback !== 'function') {
    return Promise.reject(new TypeError('rxTest requires a callback function.'));
  }

  const lock = getRealmLock();
  if (lock.callbackDepth > 0) {
    return Promise.reject(new Error('Nested rxTest calls are not supported.'));
  }

  lock.pending++;
  const previous = lock.tail.catch(() => {});
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  lock.tail = previous.then(() => current);

  return previous
    .then(() => executeRxTest(callback, config, lock))
    .finally(() => {
      release();
      lock.pending--;
      if (lock.pending === 0 && (globalThis as Record<PropertyKey, unknown>)[realmLockKey] === lock) {
        Reflect.deleteProperty(globalThis, realmLockKey);
      }
    });
}

async function executeRxTest(callback: RxTestCallback, config: RxTestConfig, lock: RealmLock): Promise<void> {
  getObservableConstructor();
  const startTime = parseStartTime(config.startTime);
  const maxVirtualTime = config.maxVirtualTime === undefined ? Infinity : durationToMilliseconds(config.maxVirtualTime);
  const maxTaskExecutions = config.maxTaskExecutions ?? 100_000;
  if (!Number.isInteger(maxTaskExecutions) || maxTaskExecutions <= 0) {
    throw new TypeError('maxTaskExecutions must be a positive integer.');
  }

  const controller = new VirtualTimeController({
    startTime,
    maxVirtualTime,
    maxTaskExecutions,
    idleBudget: durationToMilliseconds(config.idleBudget, 50),
  });
  const context = new RxTestContextImplementation(controller, config.assertDeepEqual ?? defaultAssertDeepEqual);

  let primaryError: unknown;
  let hasPrimaryError = false;
  controller.install();

  try {
    let callbackResult: void | PromiseLike<void>;
    lock.callbackDepth++;
    try {
      callbackResult = callback(context);
    } finally {
      lock.callbackDepth--;
    }
    await controller.runUntilSettled(Promise.resolve(callbackResult));
    await context.finalizeExpectations();
    context.assertNoOpenObservations();
    controller.assertNoPendingWork();
  } catch (error) {
    primaryError = error;
    hasPrimaryError = true;
  }

  try {
    controller.restore();
  } catch (restoreError) {
    if (hasPrimaryError) {
      throw new AggregateError([primaryError, restoreError], 'rxTest failed and could not completely restore the realm.');
    }
    throw restoreError;
  }

  if (hasPrimaryError) {
    throw primaryError;
  }
}

function getRealmLock(): RealmLock {
  const globalRecord = globalThis as Record<PropertyKey, unknown>;
  const existing = globalRecord[realmLockKey];
  if (isRealmLock(existing)) {
    return existing;
  }

  const lock: RealmLock = {
    tail: Promise.resolve(),
    callbackDepth: 0,
    pending: 0,
  };
  Object.defineProperty(globalThis, realmLockKey, {
    configurable: true,
    enumerable: false,
    value: lock,
    writable: false,
  });
  return lock;
}

function isRealmLock(value: unknown): value is RealmLock {
  return typeof value === 'object' && value !== null && 'tail' in value && 'callbackDepth' in value && 'pending' in value;
}

function parseStartTime(value: RxTestConfig['startTime']): number {
  if (value === undefined) {
    return 0;
  }
  const time = value instanceof Date ? value.getTime() : new Date(value).getTime();
  if (!Number.isFinite(time)) {
    throw new TypeError(`Invalid rxTest startTime: ${String(value)}`);
  }
  return time;
}
