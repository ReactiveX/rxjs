import { Observable, SchedulerLike } from 'rxjs';
import { shareReplay as higherOrder } from 'rxjs/operators';
import { ShareReplayConfig } from 'rxjs/internal-compatibility';

/**
 * @method shareReplay
 * @owner Observable
 */
export function shareReplay<T>(this: Observable<T>, config: ShareReplayConfig): Observable<T>;
export function shareReplay<T>(this: Observable<T>, bufferSize?: number, windowTime?: number, scheduler?: SchedulerLike): Observable<T>;
export function shareReplay<T>(this: Observable<T>, configOrBufferSize?: ShareReplayConfig | number, windowTime?: number, scheduler?: SchedulerLike):
  Observable<T> {
  if (configOrBufferSize && typeof configOrBufferSize === 'object') {
    return higherOrder(configOrBufferSize as ShareReplayConfig)(this) as Observable<T>;
  }
  return higherOrder(configOrBufferSize as number | undefined, windowTime, scheduler)(this) as Observable<T>;
}
