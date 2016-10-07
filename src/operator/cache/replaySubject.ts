import { CacheAdapterInterface } from '../cache';
import { ReplaySubject } from '../../ReplaySubject';
import { Subject } from '../../Subject';
import { Observable } from '../../Observable';
import { Scheduler } from '../../Scheduler';
import { Subscriber } from '../../Subscriber';
import { Subscription, ISubscription } from '../../Subscription';

export class ReplaySubjectCacheAdapter<T> implements CacheAdapterInterface<T> {
  private _subject: ReplaySubject<T>;

  constructor(private _bufferSize: number = Number.POSITIVE_INFINITY,
              private _windowTime: number = Number.POSITIVE_INFINITY,
              private _scheduler?: Scheduler) {}

  public getOrCreateSubject() {
    if (!this.hasSubject()) {
      this._subject = new ReplaySubject<T>(this._bufferSize, this._windowTime, this._scheduler);
    }
    return this._subject;
  }

  public hasSubject() {
    return this._subject !== undefined;
  }

  public resetSubject() {
    this._subject = undefined;
  }

  public cache(source: Observable<T>): Observable<T> {
    return new CacheObservable(source, this);
  }
}

class CacheObservable<T> extends Observable<T> {
  constructor(
    private destination: Observable<T>,
    private adapter: ReplaySubjectCacheAdapter<T>) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<T>) {
    let outerSub: CacheSubscriber<T>;

    if (!this.adapter.hasSubject()) {
      outerSub = new CacheSubscriber(this.adapter);
      this.destination.subscribe(outerSub);
    }

    const subscription = new Subscription();
    if (outerSub && !outerSub.closed) {
      subscription.add(new InnerRefCountSubscription(outerSub));
    }
    subscription.add(this.adapter.getOrCreateSubject().subscribe(subscriber));
    return subscription;
  }
}

interface RefCountSubscription extends ISubscription {
  increment(): void;
  decrement(): void;
  count: number;
}

class CacheSubscriber<T> extends Subscriber<T> implements RefCountSubscription {
  private _referenceCount = 0;
  private _subject: Subject<T>;

  constructor(private _adapter: ReplaySubjectCacheAdapter<T>) {
    super();
    this._subject = _adapter.getOrCreateSubject();
  }

  get count() {
    return this._referenceCount;
  }

  increment(): void {
    this._referenceCount += 1;
  }

  decrement(): void {
    this._referenceCount -= 1;
  }

  protected _next(value: T): void {
    this._subject.next(value);
  }

  protected _error(err: any): void {
    this._adapter.resetSubject();
    this._subject.error(err);
  }

  protected _complete(): void {
    this._subject.complete();
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class InnerRefCountSubscription extends Subscription {
  constructor(private parent: RefCountSubscription) {
    super();
    parent.increment();
  }

  unsubscribe() {
    const parent = this.parent;
    if (!parent.closed && !this.closed) {
      super.unsubscribe();
      parent.decrement();
      if (parent.count === 0) {
        parent.unsubscribe();
      }
    }
  }
}
