import { Observable } from 'rxjs/internal/Observable';
import { OperatorFunction, FOType, Sink, SinkArg, PartialObserver } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { lift } from 'rxjs/internal/util/lift';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';
import { sinkFromObserver } from 'rxjs/internal/util/sinkFromObserver';
import { sinkFromHandlers } from 'rxjs/internal/util/sinkFromHandlers';
import { isPartialObserver } from '../util/isPartialObserver';

export function tap<T>(
  observer: PartialObserver<T>
): OperatorFunction<T, T>

export function tap<T>(
  nextHandler?: (value: T) => void,
  errorHandler?: (err: any) => void,
  completeHandler?: () => void,
): OperatorFunction<T, T>

export function tap<T>(
  nextOrObserver?: PartialObserver<T>|((value: T) => void),
  errorHandler?: (err: any) => void,
  completeHandler?: () => void,
): OperatorFunction<T, T>

export function tap<T>(
  nextOrObserver?: PartialObserver<T>|((value: T) => void),
  errorHandler?: (err: any) => void,
  completeHandler?: () => void,
): OperatorFunction<T, T> {
  let sink: Sink<T>;
  if (isPartialObserver(nextOrObserver)) {
    sink = sinkFromObserver(nextOrObserver);
  }
  else {
    sink = sinkFromHandlers(nextOrObserver as ((value: T) => void), errorHandler, completeHandler);
  }
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      const result = tryUserFunction(sink, t, v, subs);
      if (resultIsError(result)) {
        dest(FOType.ERROR, result.error, subs);
      } else {
        dest(t, v, subs);
      }
    }, subs);
  });
}
