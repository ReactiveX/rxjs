import { DequeueReplaySubject } from '../DequeueReplaySubject';
import { Observable } from '../Observable';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { MonoTypeOperatorFunction, TeardownLogic } from '../types';

/**
 * Returns a new {@link Observable} that stores emitted values in an internal queue, and replays them to subsequent
 * subscribers. The queued values are removed from the internal queue when they are emitted from `dequeueTrigger`.
 *
 * ![](dequeueReplay.png)
 *
 * @see {@link DequeueReplaySubject}
 * @see {@link ReplaySubject}
 * @see {@link publishReplay}
 *
 * @param dequeueTrigger An {@link Observable} that emits values to be removed from the internal queue of events
 */
export function dequeueReplay<T>(dequeueTrigger: Observable<T>, ): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => source.lift(new DequeueReplayOperator(dequeueTrigger));
}

class DequeueReplayOperator<T> implements Operator<T, T> {

  private readonly subject: DequeueReplaySubject<T>;
  private readonly sources: Set<any> = new Set<any>();
  private sourceSub: Subscription | undefined = undefined;

  constructor(dequeueTrigger: Observable<T>) {
    this.subject = new DequeueReplaySubject<T>(dequeueTrigger);
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    this._addSource(source);
    return this.subject.subscribe(subscriber);
  }

  _addSource(source: any): void {
    if (this.sources.has(source)) {
      return;
    }

    const sub = source.subscribe(this.subject);
    this.sources.add(source);

    if (this.sourceSub) {
      this.sourceSub.add(sub);
    } else {
      this.sourceSub = sub;
    }
  }

}
