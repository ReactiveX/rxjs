import { Subject, subjectSource } from 'rxjs/internal/Subject';
import { FOType, FObsArg } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { sourceAsSubject } from 'rxjs/internal/util/sourceAsSubject';
import { ObjectUnsubscribedError } from './util/ObjectUnsubscribedError';


export interface BehaviorSubjectConstructor {
  new <T>(initialValue: T): BehaviorSubject<T>;
}

export interface BehaviorSubject<T> extends Subject<T> {
  getValue(): T;
}

export const BehaviorSubject: BehaviorSubjectConstructor = (<T>(initialValue: T) => {
  let completed = false;
  let value = initialValue;
  let hasError = false;
  let disposed = false;
  let error: any;
  const subject = subjectSource<T>();

  let result = ((type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    switch (type) {
      case FOType.SUBSCRIBE:
        if (!completed && !hasError) {
          arg(FOType.NEXT, value, subs);
        }
        break;
      case FOType.NEXT:
        value = arg;
        break;
      case FOType.ERROR:
        hasError = true;
        error = arg;
        break;
      case FOType.COMPLETE:
        completed = true;
        break;
      case FOType.DISPOSE:
        disposed = true;
        break;
    }
    subject(type, arg, subs);
  }) as BehaviorSubject<T>;

  result = sourceAsSubject(result) as BehaviorSubject<T>;
  result.getValue = () => {
    if (disposed) throw new ObjectUnsubscribedError();
    if (hasError) throw error;
    return value;
  };
  Object.defineProperty(result, 'value', {
    get() {
      return value
    }
  })
  return result;
}) as any;

