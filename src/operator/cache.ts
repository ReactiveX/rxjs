import { Observable } from '../Observable';
import { Scheduler } from '../Scheduler';
import { TeardownLogic } from '../Subscription';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { ReplaySubjectCacheAdapter } from './cache/replaySubject';

/**
 * @param bufferSize
 * @param windowTime
 * @param scheduler
 * @return {Observable<any>}
 * @method cache
 * @owner Observable
 */
export function cache<T>(
  bufferSize: number = Number.POSITIVE_INFINITY,
  windowTime: number = Number.POSITIVE_INFINITY,
  scheduler?: Scheduler
): Observable<T> {
  let adapter = new ReplaySubjectCacheAdapter(bufferSize, windowTime, scheduler);
  return this.lift(new CacheOperator(adapter, this));
}

export interface CacheSignature<T> {
  (bufferSize?: number, windowTime?: number, scheduler?: Scheduler): Observable<T>;
}

class CacheOperator<T> implements Operator<T, T> {
  private cachedSource: Observable<T>;

  constructor(adapter: CacheAdapterInterface<T>, source: any) {
     this.cachedSource = adapter.cache(source);
  }

  call(observer: Subscriber<T>): TeardownLogic {
    return this.cachedSource.subscribe(observer);
  }
}

export interface CacheAdapterInterface<T> {
  cache(source: Observable<T>): Observable<T>
}
