import { durationToMilliseconds, parseTimingPlan } from './marble-parser.js';
import type { ScheduledTestTask, ScheduledTestWork, TestDuration, TestIdleOptions, TestScheduleOptions, TestTimingPlan } from './types.js';

type TaskKind = 'observation-boundary' | 'observation-start' | 'immediate' | 'timer' | 'scheduled' | 'animation' | 'idle';

interface TaskRecord {
  readonly id: number;
  readonly kind: TaskKind;
  readonly order: number;
  readonly dueTime: number;
  readonly run: () => void | PromiseLike<void>;
  readonly active: () => boolean;
}

interface TimerEntry {
  readonly id: number;
  readonly controller: AbortController;
  readonly callback: (...args: unknown[]) => unknown;
  readonly args: readonly unknown[];
  readonly interval: number | undefined;
  active: boolean;
  dueTime: number;
  generation: number;
  referenced: boolean;
}

interface AnimationEntry {
  readonly id: number;
  readonly callback: FrameRequestCallback;
}

interface IdleEntry {
  readonly id: number;
  readonly callback: IdleRequestCallback;
  readonly timeoutTask?: ScheduledTestTask;
  active: boolean;
}

interface PatchRecord {
  readonly target: object;
  readonly key: PropertyKey;
  readonly hadOwnProperty: boolean;
  readonly descriptor: PropertyDescriptor | undefined;
}

export interface VirtualTimeOptions {
  readonly startTime: number;
  readonly maxVirtualTime: number;
  readonly maxTaskExecutions: number;
  readonly idleBudget: number;
}

const taskPriority: Record<TaskKind, number> = {
  'observation-boundary': -1,
  'observation-start': 0,
  immediate: 0,
  timer: 1,
  scheduled: 1,
  animation: 2,
  idle: 3,
};

export class VirtualTimeController {
  readonly #options: VirtualTimeOptions;
  readonly #testController = new AbortController();
  readonly #tasks: TaskRecord[] = [];
  readonly #timers = new Map<number, TimerEntry>();
  readonly #animationCallbacks = new Map<number, AnimationEntry>();
  readonly #idleCallbacks = new Map<number, IdleEntry>();
  readonly #trackedPromises = new Set<Promise<void>>();
  readonly #patches: PatchRecord[] = [];
  readonly #reportedErrors: unknown[] = [];

  #nextId = 0;
  #nextOrder = 0;
  #now = 0;
  #taskExecutions = 0;
  #firstError: unknown;
  #hasError = false;
  #installed = false;
  #animationConfigured = false;
  #idleConfigured = false;
  #idleBudget: number;
  #manualOperations = 0;
  #manualWaiters: Array<() => void> = [];
  #microtaskCount = 0;
  #usesNodeHandles = false;

  constructor(options: VirtualTimeOptions) {
    this.#options = options;
    this.#idleBudget = options.idleBudget;
  }

  get signal(): AbortSignal {
    return this.#testController.signal;
  }

  now(): number {
    return this.#now;
  }

  install(): void {
    if (this.#installed) {
      throw new Error('Virtual time is already installed.');
    }
    this.#installed = true;
    this.#usesNodeHandles =
      typeof (
        globalThis as {
          process?: { versions?: { node?: string } };
        }
      ).process?.versions?.node === 'string';

    try {
      this.#installTimers();
      this.#installAnimationFrames();
      this.#installIdleCallbacks();
      this.#installImmediate();
      this.#installAbortSignalTimeout();
      this.#installClocks();
      this.#installMicrotaskTracking();
      this.#installReportError();
    } catch (error) {
      this.restore();
      throw error;
    }
  }

  restore(): void {
    if (!this.#installed && this.#patches.length === 0) {
      return;
    }
    const restoreErrors: unknown[] = [];
    const reportedErrorCount = this.#reportedErrors.length;
    try {
      this.#testController.abort(this.#hasError ? this.#firstError : new DOMException('Test finished', 'AbortError'));
    } catch (error) {
      restoreErrors.push(error);
    }
    restoreErrors.push(...this.#reportedErrors.slice(reportedErrorCount));

    for (let index = this.#patches.length - 1; index >= 0; index--) {
      const patch = this.#patches[index];
      if (!patch) {
        continue;
      }
      try {
        if (patch.hadOwnProperty) {
          if (!patch.descriptor) {
            throw new Error(`Missing original descriptor for ${String(patch.key)}.`);
          }
          Object.defineProperty(patch.target, patch.key, patch.descriptor);
        } else {
          Reflect.deleteProperty(patch.target, patch.key);
        }
      } catch (error) {
        restoreErrors.push(error);
      }
    }
    this.#patches.length = 0;
    this.#installed = false;
    if (restoreErrors.length === 1) {
      throw restoreErrors[0];
    }
    if (restoreErrors.length > 1) {
      throw new AggregateError(restoreErrors, 'Could not completely restore the rxTest realm.');
    }
  }

  schedule(work: ScheduledTestWork, delay?: TestDuration, options?: TestScheduleOptions): ScheduledTestTask {
    const milliseconds = durationToMilliseconds(delay);
    return this.#scheduleAt(work, this.#now + milliseconds, options, 'scheduled');
  }

  scheduleAt(work: ScheduledTestWork, dueTime: number, options?: TestScheduleOptions): ScheduledTestTask {
    return this.#scheduleAt(work, dueTime, options, 'scheduled');
  }

  scheduleObservationAt(work: ScheduledTestWork, dueTime: number): ScheduledTestTask {
    return this.#scheduleAt(work, dueTime, undefined, 'observation-start');
  }

  scheduleObservationBoundaryAt(work: ScheduledTestWork, dueTime: number): ScheduledTestTask {
    return this.#scheduleAt(work, dueTime, undefined, 'observation-boundary');
  }

  #scheduleAt(work: ScheduledTestWork, dueTime: number, options: TestScheduleOptions | undefined, kind: TaskKind): ScheduledTestTask {
    const controller = new AbortController();
    const signal = options?.signal
      ? AbortSignal.any([this.#testController.signal, options.signal, controller.signal])
      : AbortSignal.any([this.#testController.signal, controller.signal]);
    const id = ++this.#nextId;
    let active = true;

    const cancel = (reason?: unknown): void => {
      if (!active) {
        return;
      }
      active = false;
      controller.abort(reason);
    };

    signal.addEventListener(
      'abort',
      () => {
        active = false;
      },
      { once: true }
    );

    this.#enqueue({
      id,
      kind,
      dueTime,
      active: () => active && !signal.aborted,
      run: () => {
        active = false;
        const result = work();
        if (isPromiseLike(result)) {
          this.#trackPromise(Promise.resolve(result));
        }
      },
    });

    return {
      get dueTime() {
        return dueTime;
      },
      signal,
      cancel,
    };
  }

  configureAnimation(plan: TestTimingPlan): void {
    if (this.#animationConfigured) {
      throw new Error('animate() can be called only once per rxTest.');
    }
    if (this.#now !== 0) {
      throw new Error('animate() must be called before virtual time advances.');
    }
    this.#animationConfigured = true;
    for (const dueTime of parseTimingPlan(plan)) {
      this.#enqueue({
        id: ++this.#nextId,
        kind: 'animation',
        dueTime,
        active: () => true,
        run: () => this.#runAnimationFrame(),
      });
    }
  }

  configureIdle(plan: TestTimingPlan, options?: TestIdleOptions): void {
    if (this.#idleConfigured) {
      throw new Error('idle() can be called only once per rxTest.');
    }
    if (this.#now !== 0) {
      throw new Error('idle() must be called before virtual time advances.');
    }
    this.#idleConfigured = true;
    this.#idleBudget = durationToMilliseconds(options?.budget, this.#options.idleBudget);
    for (const dueTime of parseTimingPlan(plan)) {
      this.#enqueue({
        id: ++this.#nextId,
        kind: 'idle',
        dueTime,
        active: () => true,
        run: () => this.#runIdleOpportunity(),
      });
    }
  }

  flush(): Promise<void> {
    return this.#manual(async () => {
      await this.#flushInternal();
    });
  }

  advanceBy(duration: TestDuration): Promise<void> {
    const target = this.#now + durationToMilliseconds(duration);
    return this.advanceTo(target);
  }

  advanceTo(time: TestDuration): Promise<void> {
    const target = durationToMilliseconds(time);
    return this.#manual(async () => {
      if (target < this.#now) {
        throw new Error(`Cannot move virtual time backwards from ${this.#now} to ${target}.`);
      }
      await this.#runThrough(target);
      this.#now = target;
      await this.#microtaskCheckpoint();
      this.#throwIfFailed();
    });
  }

  async runUntilSettled(body: Promise<void>): Promise<void> {
    let bodySettled = false;
    let bodyError: unknown;
    let hasBodyError = false;
    void body.then(
      () => {
        bodySettled = true;
      },
      (error) => {
        bodyError = error;
        hasBodyError = true;
        bodySettled = true;
      }
    );

    while (!bodySettled) {
      if (this.#manualOperations > 0) {
        await this.#waitForManualOperations();
        continue;
      }
      await this.#microtaskCheckpoint();
      this.#throwIfFailed();
      if (this.#manualOperations > 0) {
        continue;
      }
      if (bodySettled) {
        break;
      }

      const next = this.#takeNextActiveTask();
      if (next) {
        await this.#execute(next);
      } else {
        await body;
      }
    }

    if (hasBodyError) {
      throw bodyError;
    }
    await this.#flushInternal();
  }

  assertNoPendingWork(): void {
    const intervals = Array.from(this.#timers.values()).filter((timer) => timer.active && timer.interval !== undefined);
    const pending: string[] = [];
    if (intervals.length > 0) {
      pending.push(`${intervals.length} interval(s)`);
    }
    if (this.#animationCallbacks.size > 0) {
      pending.push(`${this.#animationCallbacks.size} animation-frame callback(s)`);
    }
    if (this.#idleCallbacks.size > 0) {
      pending.push(`${this.#idleCallbacks.size} idle callback(s)`);
    }
    if (pending.length > 0) {
      throw new Error(`rxTest finished with pending virtual work: ${pending.join(', ')}.`);
    }
  }

  recordError(error: unknown): void {
    this.#reportedErrors.push(error);
    if (!this.#hasError) {
      this.#hasError = true;
      this.#firstError = error;
    }
  }

  async #flushInternal(): Promise<void> {
    for (;;) {
      this.#throwIfFailed();
      const next = this.#takeNextActiveTask();
      if (next) {
        await this.#execute(next);
        continue;
      }
      await this.#microtaskCheckpoint();
      this.#throwIfFailed();
      const taskAfterMicrotasks = this.#takeNextActiveTask();
      if (taskAfterMicrotasks) {
        await this.#execute(taskAfterMicrotasks);
        continue;
      }
      if (this.#trackedPromises.size > 0) {
        await Promise.race(this.#trackedPromises);
        continue;
      }
      break;
    }
  }

  async #runThrough(target: number): Promise<void> {
    for (;;) {
      const next = this.#peekNextActiveTask();
      if (!next || next.dueTime > target) {
        return;
      }
      this.#takeNextActiveTask();
      await this.#execute(next);
    }
  }

  async #execute(task: TaskRecord): Promise<void> {
    if (!task.active()) {
      return;
    }
    if (task.dueTime > this.#options.maxVirtualTime) {
      throw new Error(`Virtual task at ${task.dueTime}ms exceeds maxVirtualTime ${this.#options.maxVirtualTime}ms.`);
    }
    this.#taskExecutions++;
    if (this.#taskExecutions > this.#options.maxTaskExecutions) {
      throw new Error(`rxTest exceeded maxTaskExecutions (${this.#options.maxTaskExecutions}).`);
    }

    this.#now = task.dueTime;
    try {
      const result = task.run();
      if (isPromiseLike(result)) {
        this.#trackPromise(Promise.resolve(result));
      }
    } catch (error) {
      this.recordError(error);
    }
    await this.#microtaskCheckpoint();
    this.#throwIfFailed();
  }

  #enqueue(task: Omit<TaskRecord, 'order'>): void {
    if (task.dueTime < 0) {
      // Negative hot messages are useful only as pre-zero subject history.
      // They still execute before time-zero subscriptions.
    }
    this.#tasks.push({
      ...task,
      order: ++this.#nextOrder,
    });
    this.#tasks.sort((left, right) => {
      if (left.dueTime !== right.dueTime) {
        return left.dueTime - right.dueTime;
      }
      const priorityDifference = taskPriority[left.kind] - taskPriority[right.kind];
      return priorityDifference || left.order - right.order;
    });
  }

  #peekNextActiveTask(): TaskRecord | undefined {
    let first = this.#tasks[0];
    while (first && !first.active()) {
      this.#tasks.shift();
      first = this.#tasks[0];
    }
    return first;
  }

  #takeNextActiveTask(): TaskRecord | undefined {
    this.#peekNextActiveTask();
    return this.#tasks.shift();
  }

  #trackPromise(promise: Promise<unknown>): void {
    const tracked = promise.then(
      () => {},
      (error) => {
        this.recordError(error);
      }
    );
    this.#trackedPromises.add(tracked);
    void tracked.finally(() => {
      this.#trackedPromises.delete(tracked);
    });
  }

  async #microtaskCheckpoint(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
    while (this.#microtaskCount > 0) {
      await Promise.resolve();
    }
  }

  #throwIfFailed(): void {
    if (this.#hasError) {
      throw this.#firstError;
    }
  }

  #manual<T>(operation: () => Promise<T>): Promise<T> {
    this.#manualOperations++;
    return operation().finally(() => {
      this.#manualOperations--;
      if (this.#manualOperations === 0) {
        const waiters = this.#manualWaiters;
        this.#manualWaiters = [];
        for (const resolve of waiters) {
          resolve();
        }
      }
    });
  }

  #waitForManualOperations(): Promise<void> {
    if (this.#manualOperations === 0) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.#manualWaiters.push(resolve);
    });
  }

  #installTimers(): void {
    this.#patch(globalThis, 'setTimeout', (callback: unknown, delay?: unknown, ...args: unknown[]) =>
      this.#createTimer(callback, delay, undefined, args)
    );
    this.#patch(globalThis, 'clearTimeout', (handle?: unknown) => {
      this.#clearTimer(handle);
    });
    this.#patch(globalThis, 'setInterval', (callback: unknown, delay?: unknown, ...args: unknown[]) => {
      const milliseconds = coerceTimerDelay(delay);
      return this.#createTimer(callback, milliseconds, milliseconds, args);
    });
    this.#patch(globalThis, 'clearInterval', (handle?: unknown) => {
      this.#clearTimer(handle);
    });
  }

  #createTimer(callback: unknown, delay: unknown, interval: number | undefined, args: readonly unknown[]): number | VirtualNodeTimerHandle {
    if (typeof callback !== 'function') {
      throw new TypeError('@rxjs/test supports only function timer handlers.');
    }
    const milliseconds = coerceTimerDelay(delay);
    const entry: TimerEntry = {
      id: ++this.#nextId,
      controller: new AbortController(),
      callback: callback as (...args: unknown[]) => unknown,
      args,
      interval,
      active: true,
      dueTime: this.#now + milliseconds,
      generation: 0,
      referenced: true,
    };
    this.#timers.set(entry.id, entry);
    this.#enqueueTimer(entry);
    return this.#usesNodeHandles
      ? new VirtualNodeTimerHandle(
          entry,
          () => {
            entry.generation++;
            entry.active = true;
            entry.dueTime = this.#now + milliseconds;
            this.#timers.set(entry.id, entry);
            this.#enqueueTimer(entry);
          },
          () => this.#clearTimer(entry.id)
        )
      : entry.id;
  }

  #enqueueTimer(entry: TimerEntry): void {
    const generation = entry.generation;
    this.#enqueue({
      id: entry.id,
      kind: 'timer',
      dueTime: entry.dueTime,
      active: () => entry.active && entry.generation === generation && !entry.controller.signal.aborted,
      run: () => {
        if (entry.interval === undefined) {
          entry.active = false;
          this.#timers.delete(entry.id);
        }
        const result = entry.callback(...entry.args);
        if (isPromiseLike(result)) {
          this.#trackPromise(Promise.resolve(result));
        }
        if (entry.interval !== undefined && entry.active) {
          entry.generation++;
          entry.dueTime += entry.interval;
          this.#enqueueTimer(entry);
        }
      },
    });
  }

  #clearTimer(handle?: unknown): void {
    const id = timerHandleToNumber(handle);
    const entry = this.#timers.get(id);
    if (!entry) {
      return;
    }
    entry.active = false;
    entry.generation++;
    entry.controller.abort();
    this.#timers.delete(id);
  }

  #installAnimationFrames(): void {
    this.#patch(globalThis, 'requestAnimationFrame', (callback: FrameRequestCallback): number => {
      if (typeof callback !== 'function') {
        throw new TypeError('requestAnimationFrame requires a callback function.');
      }
      const id = ++this.#nextId;
      this.#animationCallbacks.set(id, { id, callback });
      return id;
    });
    this.#patch(globalThis, 'cancelAnimationFrame', (handle: number): void => {
      this.#animationCallbacks.delete(Number(handle));
    });
  }

  #runAnimationFrame(): void {
    const callbacks = Array.from(this.#animationCallbacks.values());
    this.#animationCallbacks.clear();
    for (const entry of callbacks) {
      try {
        entry.callback(this.#now);
      } catch (error) {
        this.recordError(error);
      }
    }
  }

  #installIdleCallbacks(): void {
    this.#patch(globalThis, 'requestIdleCallback', (callback: IdleRequestCallback, options?: IdleRequestOptions): number => {
      if (typeof callback !== 'function') {
        throw new TypeError('requestIdleCallback requires a callback function.');
      }
      const id = ++this.#nextId;
      const entry: IdleEntry = { id, callback, active: true };
      if (options?.timeout !== undefined) {
        const timeoutTask = this.schedule(() => this.#runIdleCallback(entry, true), coerceTimerDelay(options.timeout));
        Object.assign(entry, { timeoutTask });
      }
      this.#idleCallbacks.set(id, entry);
      return id;
    });
    this.#patch(globalThis, 'cancelIdleCallback', (handle: number): void => {
      const entry = this.#idleCallbacks.get(Number(handle));
      if (entry) {
        entry.active = false;
        entry.timeoutTask?.cancel();
        this.#idleCallbacks.delete(entry.id);
      }
    });
  }

  #runIdleOpportunity(): void {
    const callbacks = Array.from(this.#idleCallbacks.values());
    for (const entry of callbacks) {
      this.#runIdleCallback(entry, false);
    }
  }

  #runIdleCallback(entry: IdleEntry, didTimeout: boolean): void {
    if (!entry.active) {
      return;
    }
    entry.active = false;
    entry.timeoutTask?.cancel();
    this.#idleCallbacks.delete(entry.id);
    const deadline: IdleDeadline = {
      didTimeout,
      timeRemaining: () => (didTimeout ? 0 : this.#idleBudget),
    };
    try {
      entry.callback(deadline);
    } catch (error) {
      this.recordError(error);
    }
  }

  #installImmediate(): void {
    if (typeof (globalThis as { setImmediate?: unknown }).setImmediate !== 'function') {
      return;
    }
    this.#patch(globalThis, 'setImmediate', (callback: unknown, ...args: unknown[]) => {
      if (typeof callback !== 'function') {
        throw new TypeError('setImmediate requires a callback function.');
      }
      const entry: TimerEntry = {
        id: ++this.#nextId,
        controller: new AbortController(),
        callback: callback as (...args: unknown[]) => unknown,
        args,
        interval: undefined,
        active: true,
        dueTime: this.#now,
        generation: 0,
        referenced: true,
      };
      this.#timers.set(entry.id, entry);
      const generation = entry.generation;
      this.#enqueue({
        id: entry.id,
        kind: 'immediate',
        dueTime: this.#now,
        active: () => entry.active && entry.generation === generation,
        run: () => {
          entry.active = false;
          this.#timers.delete(entry.id);
          const result = entry.callback(...entry.args);
          if (isPromiseLike(result)) {
            this.#trackPromise(Promise.resolve(result));
          }
        },
      });
      return this.#usesNodeHandles
        ? new VirtualNodeTimerHandle(
            entry,
            () => {},
            () => this.#clearTimer(entry.id)
          )
        : entry.id;
    });
    this.#patch(globalThis, 'clearImmediate', (handle?: unknown) => {
      this.#clearTimer(handle);
    });
  }

  #installAbortSignalTimeout(): void {
    if (typeof globalThis.AbortSignal.timeout !== 'function') {
      return;
    }
    this.#patch(globalThis.AbortSignal, 'timeout', (delay: number): AbortSignal => {
      const controller = new AbortController();
      this.schedule(() => {
        controller.abort(new DOMException('The operation timed out.', 'TimeoutError'));
      }, coerceTimerDelay(delay));
      return controller.signal;
    });
  }

  #installClocks(): void {
    const OriginalDate = globalThis.Date;
    const currentTime = () => this.#options.startTime + this.#now;
    const VirtualDate = function (this: Date, ...args: unknown[]): Date | string {
      if (!new.target) {
        return new OriginalDate(currentTime()).toString();
      }
      const constructorArgs = args.length === 0 ? [currentTime()] : args;
      return Reflect.construct(OriginalDate, constructorArgs, new.target === VirtualDate ? OriginalDate : new.target) as Date;
    } as unknown as DateConstructor;
    Object.setPrototypeOf(VirtualDate, OriginalDate);
    Object.defineProperty(VirtualDate, 'prototype', {
      value: OriginalDate.prototype,
    });
    Object.defineProperty(VirtualDate, 'now', {
      configurable: true,
      value: currentTime,
    });
    this.#patch(globalThis, 'Date', VirtualDate);

    const performanceObject = (globalThis as { performance?: Performance }).performance;
    if (performanceObject && typeof performanceObject.now === 'function') {
      this.#patch(performanceObject, 'now', () => this.#now);
    }
  }

  #installMicrotaskTracking(): void {
    const originalQueueMicrotask = globalThis.queueMicrotask;
    this.#patch(globalThis, 'queueMicrotask', (callback: VoidFunction): void => {
      if (typeof callback !== 'function') {
        throw new TypeError('queueMicrotask requires a callback function.');
      }
      this.#microtaskCount++;
      originalQueueMicrotask(() => {
        try {
          callback();
        } catch (error) {
          this.recordError(error);
        } finally {
          this.#microtaskCount--;
        }
      });
    });
  }

  #installReportError(): void {
    this.#patch(globalThis, 'reportError', (error: unknown): void => {
      this.recordError(error);
    });
  }

  #patch(target: object, key: PropertyKey, value: unknown): void {
    const hadOwnProperty = Object.prototype.hasOwnProperty.call(target, key);
    const descriptor = Object.getOwnPropertyDescriptor(target, key);
    this.#patches.push({
      target,
      key,
      hadOwnProperty,
      descriptor,
    });
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: descriptor?.enumerable ?? false,
      writable: true,
      value,
    });
  }
}

class VirtualNodeTimerHandle {
  readonly #entry: TimerEntry;
  readonly #refresh: () => void;
  readonly #cancel: () => void;

  constructor(entry: TimerEntry, refresh: () => void, cancel: () => void) {
    this.#entry = entry;
    this.#refresh = refresh;
    this.#cancel = cancel;
  }

  ref(): this {
    this.#entry.referenced = true;
    return this;
  }

  unref(): this {
    this.#entry.referenced = false;
    return this;
  }

  hasRef(): boolean {
    return this.#entry.referenced;
  }

  refresh(): this {
    this.#refresh();
    return this;
  }

  [Symbol.toPrimitive](): number {
    return this.#entry.id;
  }

  [Symbol.dispose](): void {
    this.#cancel();
  }
}

function timerHandleToNumber(handle: unknown): number {
  if (handle == null) {
    return NaN;
  }
  return Number(handle);
}

function coerceTimerDelay(value: unknown): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function isPromiseLike(value: unknown): value is PromiseLike<void> {
  return (
    (typeof value === 'object' || typeof value === 'function') && value !== null && typeof (value as { then?: unknown }).then === 'function'
  );
}
