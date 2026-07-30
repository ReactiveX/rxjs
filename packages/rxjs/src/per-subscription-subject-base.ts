import { ColdObservable } from './cold-observable.js';
import type { SubjectLike } from './util/types.js';

/**
 * Advanced base class for hot Subject variants that need custom setup for
 * every direct subscription.
 *
 * This is a Subject base, not a general-purpose Subject implementation. Most
 * consumers should use {@link Subject}, `behaviorSubject`, or `replaySubject`
 * instead. Subclass it only when each observer must receive subscription-local
 * setup—such as a current value or a replay buffer—before joining the
 * Subject's live fanout.
 *
 * Despite the phrase "per subscription", instances of this class are hot. The
 * Subject is the producer, and it exists before any observer subscribes. What
 * changes per subscription is the setup performed for that observer, not the
 * producer's existence.
 *
 * @warning The {@link _subscribe} hook is reached through the compatibility
 * `subscribe()` implementation inherited from `ColdObservable`. It runs for
 * each direct JavaScript call to `subject.subscribe(...)`. Native Observable
 * methods are allowed to use the platform's internal subscription algorithm,
 * which can bypass an overridden JavaScript `subscribe` method. Do not rely on
 * this hook as a transparent interception point for native operators.
 *
 * @typeParam In The type accepted by {@link next}.
 * @typeParam Out The type delivered to observers. Subclasses using different
 * input and output types are responsible for making that conversion safe.
 */
export abstract class PerSubscriptionSubjectBase<In, Out = In> extends ColdObservable<Out> implements SubjectLike<In, Out> {
  #completed = false;
  #hasError = false;
  #error: any = null;
  #observers = new Set<Observer<Out>>();

  /**
   * Whether this Subject can still accept values and observers.
   *
   * The Subject becomes inactive permanently after its first call to
   * {@link error} or {@link complete}. Subclasses should use this property
   * before mutating retained state in an overridden notification method.
   */
  get active() {
    return !this.#completed && !this.#hasError;
  }

  /**
   * Creates the advanced per-direct-subscription base.
   *
   * The protected constructor deliberately prevents this base from being used
   * as an ordinary Subject. Concrete subclasses must define the
   * subscription-specific behavior they need, or use the default
   * {@link _subscribe} implementation explicitly.
   */
  protected constructor() {
    super((subscriber) => this._subscribe(subscriber));
  }

  /**
   * Performs setup for one direct subscription to this Subject instance.
   *
   * `ColdObservable.subscribe()` calls this hook once for each direct
   * `subject.subscribe(...)` call, with a distinct compatibility Subscriber.
   * The default implementation immediately reports a retained terminal event
   * to late subscribers; otherwise, it adds the subscriber to live fanout.
   *
   * Subclasses may override this hook to emit retained state, replay buffered
   * values, or perform other observer-local setup. An override must preserve
   * terminal behavior and teardown registration. In the common case, perform
   * the custom setup and then call `super._subscribe(subscriber)`. A subclass
   * that needs a different order—such as joining live fanout before replay to
   * support reentrancy—can call {@link addSubscriber} directly, but then owns
   * the full terminal and cancellation contract.
   *
   * Check `subscriber.active` while doing multi-step or asynchronous setup.
   * An exception thrown by this method is caught by `ColdObservable` and sent
   * to this subscriber's error handler.
   *
   * @warning This is a direct-subscription compatibility hook, not a native
   * Observable protocol hook. Native methods can bypass it by using the
   * platform's internal subscription algorithm.
   */
  protected _subscribe(subscriber: Subscriber<Out>): void {
    if (!this.active) {
      if (this.#hasError) {
        subscriber.error(this.#error);
        return;
      }

      subscriber.complete();
      return;
    }

    this.addSubscriber(subscriber);
  }

  /**
   * Adds one subscriber to live Subject fanout and removes it when cancelled.
   *
   * This method does not emit retained values and does not inspect terminal
   * state. It is a low-level primitive for subclasses whose `_subscribe`
   * ordering cannot be expressed by calling `super._subscribe(...)`.
   */
  protected addSubscriber(subscriber: Subscriber<Out>): void {
    this.#observers.add(subscriber);
    subscriber.addTeardown(() => {
      this.#observers.delete(subscriber);
    });
  }

  /**
   * Sends a value to a snapshot of the currently subscribed observers.
   *
   * Calls after termination are ignored. Snapshotting keeps reentrant
   * subscription changes from mutating the fanout iteration already in
   * progress.
   */
  next(value: In): void {
    if (this.active) {
      const observers = Array.from(this.#observers);
      for (const observer of observers) {
        observer.next(value as any);
      }
    }
  }

  /**
   * Permanently errors the Subject and every current observer.
   *
   * The first terminal notification wins. The error is retained so the
   * default {@link _subscribe} implementation can deliver it immediately to a
   * late direct subscriber.
   */
  error(error: any): void {
    if (this.active) {
      this.#hasError = true;
      this.#error = error;
      const observers = Array.from(this.#observers);
      this.#observers.clear();
      for (const observer of observers) {
        observer.error(error);
      }
    }
  }

  /**
   * Permanently completes the Subject and every current observer.
   *
   * The first terminal notification wins. The completed state is retained so
   * the default {@link _subscribe} implementation can complete a late direct
   * subscriber immediately.
   */
  complete(): void {
    if (this.active) {
      this.#completed = true;
      const observers = Array.from(this.#observers);
      this.#observers.clear();
      for (const observer of observers) {
        observer.complete();
      }
    }
  }
}
