import { ExpectationManager } from './assertions.js';
import { parseMarbles, parseTimeMarbles } from './marble-parser.js';
import { createColdTestObservable, createHotTestObservable, createPlatformTestObservable } from './test-sources.js';
import type {
  InternalRxTestContext,
  MarbleValues,
  ObservableExpectation,
  RxTestAssertDeepEqual,
  ScheduledTestTask,
  ScheduledTestWork,
  SubscriptionExpectation,
  TestColdObservable,
  TestDuration,
  TestHotObservable,
  TestIdleOptions,
  TestPlatformObservable,
  TestScheduleOptions,
  TestSubscriptionLog,
  TestTimingPlan,
} from './types.js';
import type { VirtualTimeController } from './virtual-time.js';

export class RxTestContextImplementation implements InternalRxTestContext {
  readonly controller: VirtualTimeController;
  readonly #expectations: ExpectationManager;

  constructor(controller: VirtualTimeController, assertDeepEqual: RxTestAssertDeepEqual) {
    this.controller = controller;
    this.#expectations = new ExpectationManager(controller, assertDeepEqual);
    this.cold = this.cold.bind(this);
    this.hot = this.hot.bind(this);
    this.observable = this.observable.bind(this);
    this.time = this.time.bind(this);
    this.now = this.now.bind(this);
    this.schedule = this.schedule.bind(this);
    this.expectObservable = this.expectObservable.bind(this);
    this.expectSubscriptions = this.expectSubscriptions.bind(this);
    this.animate = this.animate.bind(this);
    this.idle = this.idle.bind(this);
    this.flush = this.flush.bind(this);
    this.advanceBy = this.advanceBy.bind(this);
    this.advanceTo = this.advanceTo.bind(this);
  }

  get signal(): AbortSignal {
    return this.controller.signal;
  }

  cold<T = string>(marbles: string, values?: MarbleValues<T>, error?: unknown): TestColdObservable<T> {
    return createColdTestObservable(this.controller, parseMarbles(marbles, values, error));
  }

  hot<T = string>(marbles: string, values?: MarbleValues<T>, error?: unknown): TestHotObservable<T> {
    return createHotTestObservable(this.controller, parseMarbles(marbles, values, error, { hot: true }));
  }

  observable<T = string>(marbles: string, values?: MarbleValues<T>, error?: unknown): TestPlatformObservable<T> {
    return createPlatformTestObservable(this.controller, parseMarbles(marbles, values, error));
  }

  time(marbles: string): number {
    return parseTimeMarbles(marbles);
  }

  now(): number {
    return this.controller.now();
  }

  schedule(work: ScheduledTestWork, delay?: TestDuration, options?: TestScheduleOptions): ScheduledTestTask {
    return this.controller.schedule(work, delay, options);
  }

  expectObservable<T>(actual: Observable<T>, subscriptionMarbles?: string | null): ObservableExpectation<T> {
    return this.#expectations.expectObservable(actual, subscriptionMarbles);
  }

  expectSubscriptions(actual: readonly TestSubscriptionLog[]): SubscriptionExpectation {
    return this.#expectations.expectSubscriptions(actual);
  }

  animate(plan: TestTimingPlan): void {
    this.controller.configureAnimation(plan);
  }

  idle(plan: TestTimingPlan, options?: TestIdleOptions): void {
    this.controller.configureIdle(plan, options);
  }

  async flush(): Promise<void> {
    await this.controller.flush();
    await this.#expectations.evaluate();
  }

  advanceBy(duration: TestDuration): Promise<void> {
    return this.controller.advanceBy(duration);
  }

  advanceTo(time: TestDuration): Promise<void> {
    return this.controller.advanceTo(time);
  }

  finalizeExpectations(): Promise<void> {
    return this.#expectations.evaluate();
  }

  assertNoOpenObservations(): void {
    this.#expectations.assertNoOpenObservations();
  }
}
