import { Observable } from './Observable';
import { Subject } from './Subject';
import { Subscription } from './Subscription';
import { PartialObserver } from './types';
import { toSubscriber } from './util/toSubscriber';

/**
 * A variant of {@link Subject} that "replays" old values to new subscribers by emitting them when they first subscribe.
 *
 * While similar in behavior to {@link ReplaySubject}, `DequeueReplaySubject` allows the "old" values to be removed by
 * specifying a "dequeue trigger" {@link Observable}. Any values emitted from the "dequeue trigger" are removed from the
 * array of "old" values if they are present, and will not be emitted to future subscribers.
 *
 * `DequeueReplaySubject` subscribes to the "dequeue trigger" Observable the first time a value is emitted, before the
 * value is added to the internal array of values, and before the value is re-emitted. This allows values to be
 * "dequeued" immediately. The "dequeue trigger" subscription remains active until the `DequeueReplaySubject` completes
 * AND all queued events have been dequeued, OR the "dequeue trigger" Observable errors. If the "dequeue trigger"
 * errors, the `DequeueReplaySubject` will also emit the same error. If this behavior is undesired, pipe the
 * "dequeue trigger" Observable through the {@link catchError} operator before passing it to the `DequeueReplaySubect`
 * constructor.
 *
 * @see {@link dequeueReplay}
 */
export class DequeueReplaySubject<T> extends Subject<T> {
  private readonly _events: T[] = [];
  private _dequeueSub: Subscription | undefined = undefined;

  constructor(private dequeueTrigger: Observable<T>) {
    super();
  }

  next(value: T): void {
    this._dequeue();
    this._events.push(value);
    super.next(value);
  }

  subscribe(observer?: PartialObserver<T>): Subscription;
  /** @deprecated Use an observer instead of a complete callback */
  subscribe(next: null | undefined, error: null | undefined, complete: () => void): Subscription;
  /** @deprecated Use an observer instead of an error callback */
  subscribe(next: null | undefined, error: (error: any) => void, complete?: () => void): Subscription;
  /** @deprecated Use an observer instead of a complete callback */
  subscribe(next: (value: T) => void, error: null | undefined, complete: () => void): Subscription;
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;
  subscribe(observerOrNext?: PartialObserver<T> | ((value: T) => void) | null,
            error?: ((error: any) => void) | null,
            complete?: (() => void) | null): Subscription {
    const sink = toSubscriber(observerOrNext, error, complete);
    this._events.forEach(sink.next.bind(sink));
    return super.subscribe(sink);
  }

  /** @internal */
  _dequeue(): void {
    if (!this._dequeueSub) {
      this._dequeueSub = this.dequeueTrigger.subscribe(
        this._dequeueNext.bind(this),
        this.error.bind(this),
      );
    }
  }

  /** @internal */
  _dequeueNext(event: T): void {
    const index = this._events.indexOf(event);
    if (index >= 0) {
      this._events.splice(index, 1);
    }
    if (this.isStopped && !this._events.length && this._dequeueSub) {
      this._dequeueSub.unsubscribe();
    }
  }

}
