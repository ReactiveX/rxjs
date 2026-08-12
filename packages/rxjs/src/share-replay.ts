import { replaySubject } from './replay-subject.js';
import { share } from './share.js';

export const shareReplay: unique symbol = Symbol('shareReplay');

export interface ShareReplayConfig {
  bufferSize?: number;
  windowTime?: number;
  refCount: boolean;
  scheduler?: unknown;
}

declare global {
  interface Observable<T> {
    [shareReplay](config: ShareReplayConfig): Observable<T>;
    [shareReplay](bufferSize?: number, windowTime?: number, scheduler?: unknown): Observable<T>;
  }
}

Observable.prototype[shareReplay] = function <T>(
  this: Observable<T>,
  configOrBufferSize?: ShareReplayConfig | number,
  windowTime = Infinity,
  scheduler?: unknown
): Observable<T> {
  if (scheduler !== undefined) {
    throw new Error('Scheduler-backed shareReplay is not supported by this Symbol contract.');
  }

  let bufferSize = Infinity;
  let refCount = false;

  if (configOrBufferSize && typeof configOrBufferSize === 'object') {
    if (configOrBufferSize.scheduler !== undefined) {
      throw new Error('Scheduler-backed shareReplay is not supported by this Symbol contract.');
    }

    bufferSize = configOrBufferSize.bufferSize ?? Infinity;
    windowTime = configOrBufferSize.windowTime ?? Infinity;
    refCount = configOrBufferSize.refCount ?? false;
  } else {
    bufferSize = configOrBufferSize ?? Infinity;
  }

  return this[share]({
    connector: () =>
      replaySubject<T>({
        size: bufferSize,
        maxAge: windowTime,
      }),
    resetOnError: true,
    resetOnComplete: false,
    resetOnRefCountZero: refCount,
  });
};
