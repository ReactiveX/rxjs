import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { ReplaySubject } from '../ReplaySubject';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { MonoTypeOperatorFunction, SchedulerLike } from '../types';

export interface ShareReplayConfig {
  bufferSize?: number;
  windowTime?: number;
  scheduler?: SchedulerLike;
  disconnect?: boolean;
}

/**
 * Share source and replay specified number of emissions on subscription.
 *
 * This operator is a specialization of `replay` that connects to a source observable
 * and multicasts through a `ReplaySubject` constructed with the specified arguments.
 * A successfully completed source will stay cached in the `shareReplayed observable` forever,
 * but an errored source can be retried.
 *
 * ## Why use shareReplay?
 * You generally want to use `shareReplay` when you have side-effects or taxing computations
 * that you do not wish to be executed amongst multiple subscribers.
 * It may also be valuable in situations where you know you will have late subscribers to
 * a stream that need access to previously emitted values.
 * This ability to replay values on subscription is what differentiates {@link share} and `shareReplay`.
 *
 * ## What is configurable?
 * The following behaviors are configurable the ShareReplayConfig object
 * * bufferSize -  Maximum element count of the replay buffer. (default: Number.POSITIVE_INFINITY)
 * * windowTime -  Maximum time length of the replay buffer in milliseconds. (default: Number.POSITIVE_INFINITY)
 * * scheduler -   Scheduler where connected observers within the selector function. (default: none)
 * * disconnect -  If set, when the reference count drops to zero, the replay buffer will clear. (default: false)
 *
 * ![](shareReplay.png)
 *
 * ## Example
 * ```javascript
 * const obs$ = interval(1000);
 * const subscription = obs$.pipe(
 *   take(4),
 *   shareReplay({bufferSize: 3})
 * );
 * subscription.subscribe(x => console.log('source A: ', x));
 * subscription.subscribe(y => console.log('source B: ', y));
 *
 * ```
 *
 * @see {@link publish}
 * @see {@link share}
 * @see {@link publishReplay}
 *
 * @param {Object} config a configuration object to define `bufferSize`, `windowTime`, `scheduler`,
 * and `disconnect` behavior. Defaults to `{ }`.
 * @return {Observable} An observable sequence that contains the elements of a sequence produced
 * by multicasting the source sequence within a selector function.
 * @method shareReplay
 * @owner Observable
 */
export function shareReplay<T>(
  configOrBuffersize?: ShareReplayConfig | number,
  windowTime: number = Number.POSITIVE_INFINITY,
  scheduler?: SchedulerLike
): MonoTypeOperatorFunction<T> {
  // absorb old-style arguments, if given
  const config: ShareReplayConfig =
    (typeof (configOrBuffersize) === 'number') ? {
      bufferSize: configOrBuffersize,
      windowTime,
      scheduler,
    } : (configOrBuffersize || {});

  return (source: Observable<T>) => source.lift(new ShareReplayOperator(config));
}

class ShareReplayOperator<T> implements Operator<T, T> {
  refCount = 0;
  subject: ReplaySubject<T>;
  subscription: Subscription;
  hasError = false;

  constructor(private readonly config: ShareReplayConfig) { }

  call(subscriber: Subscriber<T>, source: any) {
    const op = this;
    this.refCount++;
    if (!this.subject || this.hasError) {
      this.hasError = false;
      this.subject = new ReplaySubject<T>(this.config.bufferSize, this.config.windowTime, this.config.scheduler);

      this.subscription = source.subscribe({
        next(value: T) {
          op.subject.next(value);
        },
        error(err: any) {
          op.hasError = true;
          op.subject.error(err);
        },
        complete() {
          op.subject.complete();
        },
      });
    }

    return this.subject.subscribe(new ShareReplaySubscriber<T>(subscriber, op));
  }

  teardown() {
    this.refCount--;
    if (this.subject && (this.refCount === 0) && this.config.disconnect) {
      this.subscription.unsubscribe();
      this.subject = undefined;
    }
  }
}

class ShareReplaySubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<T>, private op: ShareReplayOperator<T>) {
    super(destination);
  }
  unsubscribe() {
    if (!this.isStopped) {
      super.unsubscribe();
      this.op.teardown();
    }
  }
}
