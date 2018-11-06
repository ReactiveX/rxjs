import { Subject, subjectSource } from 'rxjs/internal/Subject';
import { FOType, FObsArg } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { sourceAsSubject } from 'rxjs/internal/util/sourceAsSubject';


export interface AsyncSubjectConstructor {
  new <T>(): AsyncSubject<T>;
}

export interface AsyncSubject<T> extends Subject<T> {
}

export const AsyncSubject: AsyncSubjectConstructor = (<T>() => {
  let hasValue = false;
  let hasCompleted = false;
  let hasError = false;
  let value: T;
  const subject = subjectSource<T>();

  let result = ((type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    if (!hasError) {
      switch (type) {
        case FOType.SUBSCRIBE:
          if (hasCompleted && hasValue) {
            arg(FOType.NEXT, value, subs);
          }
          break;
        case FOType.NEXT:
          if (!hasCompleted && !hasError) {
            hasValue = true;
            value = arg;
          }
          return;
        case FOType.ERROR:
          hasError = true;
          break;
        case FOType.COMPLETE:
          hasCompleted = true;
          if (hasValue) {
            subject(FOType.NEXT, value, subs);
          }
          break;
      }
    }
    subject(type, arg, subs);
  }) as AsyncSubject<T>;

  result = sourceAsSubject(result) as AsyncSubject<T>;
  return result;
}) as any;

