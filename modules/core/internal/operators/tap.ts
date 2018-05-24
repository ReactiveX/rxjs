import { Observable, sourceAsObservable } from '../Observable';
import { Operation, FOType, Sink, SinkArg, FObs } from '../types';
import { Subscription } from '../Subscription';
import { PartialObserver } from 'dist-compat/typings/src';

export function tap<T>(
  observer: PartialObserver<T>
): Operation<T, T>

export function tap<T>(
  nextHandler?: (value: T) => void,
  errorHandler?: (err: any) => void,
  completeHandler?: () => void,
): Operation<T, T>

export function tap<T>(
  nextOrObserver?: PartialObserver<T>|((value: T) => void),
  errorHandler?: (err: any) => void,
  completeHandler?: () => void,
): Operation<T, T>

export function tap<T>(
  nextOrObserver?: PartialObserver<T>|((value: T) => void),
  errorHandler?: (err: any) => void,
  completeHandler?: () => void,
): Operation<T, T> {
  let nextHandler: (value: T) => void;

  if (nextOrObserver) {
    if (typeof nextOrObserver === 'object') {
      nextHandler = nextOrObserver.next && nextOrObserver.next.bind(nextOrObserver);
      errorHandler = nextOrObserver.error && nextOrObserver.error.bind(nextOrObserver);
      completeHandler = nextOrObserver.complete && nextOrObserver.complete.bind(nextOrObserver);
    } else {
      nextHandler = nextOrObserver;
    }
  }

  return (source: Observable<T>) =>
    sourceAsObservable((type: FOType, dest: Sink<T>, subs: Subscription) => {
      if (type === FOType.SUBSCRIBE) {
        source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
          switch (t) {
            case FOType.NEXT:
              if (nextHandler) nextHandler(v);
              break;
            case FOType.ERROR:
              if (errorHandler) errorHandler(v);
              break;
            case FOType.COMPLETE:
              if (completeHandler) completeHandler();
              break;
          }
          dest(t, v, subs);
        }, subs);
      }
    });
}
