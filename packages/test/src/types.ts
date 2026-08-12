import type { MarbleDuration, MarbleMessage, MarbleNotification, MarbleTimingPlan, MarbleValueLookup } from './marble-parser.js';
import type { VirtualTimeController } from './virtual-time.js';

/** A virtual duration. Numbers are milliseconds. */
export type TestDuration = MarbleDuration;

/**
 * Animation or idle opportunities expressed as marble markers or absolute
 * virtual millisecond timestamps.
 */
export type TestTimingPlan = MarbleTimingPlan;

/** Values substituted for ordinary markers in a marble diagram. */
export type MarbleValues<T> = MarbleValueLookup<T>;

/** The callback executed inside an isolated `rxTest` virtual-time realm. */
export type RxTestCallback = (context: RxTestContext) => void | PromiseLike<void>;

/** Assertion adapter used for observable and subscription expectations. */
export type RxTestAssertDeepEqual = (actual: unknown, expected: unknown, info: RxTestAssertionInfo) => void | PromiseLike<void>;

/** Metadata describing the assertion currently being evaluated. */
export interface RxTestAssertionInfo {
  /** The kind of recorded data being compared. */
  readonly kind: 'observable' | 'subscriptions';
  /** The expected marble expression, when one was supplied. */
  readonly marbles?: string | readonly string[];
}

/** Configuration for one `rxTest` execution. */
export interface RxTestConfig {
  /**
   * Custom deep-equality assertion. The default throws
   * `RxTestAssertionError` and works without a test-framework adapter.
   */
  assertDeepEqual?: RxTestAssertDeepEqual;
  /**
   * Epoch used by virtual `Date`. Context time and `performance.now()` still
   * begin at zero.
   * @default 0
   */
  startTime?: number | string | Date;
  /**
   * Largest virtual timestamp that may be entered.
   * @default Infinity
   */
  maxVirtualTime?: TestDuration;
  /**
   * Callback execution limit used to diagnose self-scheduling loops.
   * @default 100000
   */
  maxTaskExecutions?: number;
  /**
   * Default `IdleDeadline.timeRemaining()` budget.
   * @default 50
   */
  idleBudget?: TestDuration;
}

/** Work scheduled directly through `RxTestContext.schedule`. */
export type ScheduledTestWork = () => void | PromiseLike<void>;

/** Options for directly scheduled test work. */
export interface TestScheduleOptions {
  /** Cancels the task when aborted. */
  readonly signal?: AbortSignal;
}

/** A cancellable virtual task. */
export interface ScheduledTestTask {
  /** Absolute due time in virtual milliseconds. */
  readonly dueTime: number;
  /** Aborted on cancellation, test completion, or test failure. */
  readonly signal: AbortSignal;
  /** Cancels the task. Repeated calls have no effect. */
  cancel(reason?: unknown): void;
}

/** Options applied to an idle-opportunity plan. */
export interface TestIdleOptions {
  /** Overrides the configured idle budget for this plan. */
  readonly budget?: TestDuration;
}

/** A recorded next, error, or completion notification. */
export type TestNotification<T> = MarbleNotification<T>;

/** An Observable notification and its absolute virtual timestamp. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Keep this public interface augmentable for downstream test adapters.
export interface TestMessage<T = unknown> extends MarbleMessage<T> {}

/**
 * A producer or observer lifetime. Legacy field names are retained, but each
 * frame is one virtual millisecond.
 */
export interface TestSubscriptionLog {
  readonly subscribedFrame: number;
  readonly unsubscribedFrame: number;
}

/** Properties common to marble-created test sources. */
export interface TestSource<T> extends Observable<T> {
  readonly kind: 'cold' | 'hot' | 'observable';
  readonly messages: readonly TestMessage<T>[];
  readonly subscriptions: readonly TestSubscriptionLog[];
}

/** An RxJS 7-style producer-per-subscription test source. */
export interface TestColdObservable<T> extends TestSource<T> {
  readonly kind: 'cold';
}

/**
 * A platform-lifecycle source whose log records active producer windows.
 */
export interface TestPlatformObservable<T> extends TestSource<T> {
  readonly kind: 'observable';
}

/** A subject-like source controlled by an absolute marble timeline. */
export interface TestHotObservable<T> extends TestSource<T> {
  readonly kind: 'hot';
  readonly active: boolean;
  next(value: T): void;
  error(error: unknown): void;
  complete(): void;
}

/** Matchers for a recorded Observable. */
export interface ObservableExpectation<T> {
  /** Compares recorded notifications with a marble diagram. */
  toBe(marbles: string, values?: MarbleValues<T>, error?: unknown): void;
  /** Compares recorded notifications with exact timestamped messages. */
  toBe(messages: readonly TestMessage<T>[]): void;
  /** Compares with another Observable recorded through the same window. */
  toEqual(expected: Observable<T>): void;
}

/** Matcher for observer or producer-activation logs. */
export interface SubscriptionExpectation {
  /** Compares the live logs with one or more subscription diagrams. */
  toBe(marbles: string | readonly string[]): void;
}

/** Factories, assertions, and virtual-time controls available inside `rxTest`. */
export interface RxTestContext {
  /** Aborted when the test completes or fails. */
  readonly signal: AbortSignal;

  /**
   * Creates an RxJS 7-style cold source: subscription creates an independent
   * producer and timeline for every observer.
   */
  cold<T = string>(marbles: string, values?: MarbleValues<T>, error?: unknown): TestColdObservable<T>;

  /**
   * Creates a subject-like source whose diagram is absolute test time.
   */
  hot<T = string>(marbles: string, values?: MarbleValues<T>, error?: unknown): TestHotObservable<T>;

  /**
   * Creates a platform source. The first observer creates its active producer,
   * concurrent observers share it, and observation after ref-count closure
   * creates a new producer.
   */
  observable<T = string>(marbles: string, values?: MarbleValues<T>, error?: unknown): TestPlatformObservable<T>;

  /** Returns the timestamp of the single `|` in a timing diagram. */
  time(marbles: string): number;
  /** Returns elapsed virtual milliseconds since the test began. */
  now(): number;

  /** Schedules work on the virtual task queue. */
  schedule(work: ScheduledTestWork, delay?: TestDuration, options?: TestScheduleOptions): ScheduledTestTask;

  /** Registers an observable-output expectation. */
  expectObservable<T>(actual: Observable<T>, subscriptionMarbles?: string | null): ObservableExpectation<T>;

  /** Registers an expectation against a test source's live logs. */
  expectSubscriptions(actual: readonly TestSubscriptionLog[]): SubscriptionExpectation;

  /** Declares animation-frame opportunities. May be called once at time zero. */
  animate(plan: TestTimingPlan): void;
  /** Declares idle opportunities. May be called once at time zero. */
  idle(plan: TestTimingPlan, options?: TestIdleOptions): void;
  /** Drains finite virtual work and evaluates current expectations. */
  flush(): Promise<void>;
  /** Advances by a relative duration and drains work due through that time. */
  advanceBy(duration: TestDuration): Promise<void>;
  /** Advances to an absolute virtual timestamp. */
  advanceTo(time: TestDuration): Promise<void>;
}

export interface InternalRxTestContext extends RxTestContext {
  readonly controller: VirtualTimeController;
  finalizeExpectations(): Promise<void>;
  assertNoOpenObservations(): void;
}
