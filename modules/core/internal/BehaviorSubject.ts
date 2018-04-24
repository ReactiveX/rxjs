import { Subject, sourceAsSubject, subjectSource } from "./Subject";
import { FOType, FObsArg } from "./types";
import { Subscription } from "./Subscription";
import { sourceAsObservable } from "./Observable";


export interface BehaviorSubjectConstructor {
  new <T>(initialValue: T): BehaviorSubject<T>;
}

export interface BehaviorSubject<T> extends Subject<T> {
  getValue(): T;
}

export const BehaviorSubject: BehaviorSubjectConstructor = (<T>(initialValue: T) => {
  let value = initialValue;
  let hasError = false;
  let error: any;
  const subject = subjectSource<T>();

  let result = ((type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      arg(FOType.NEXT, value, subs);
    } else if (type === FOType.NEXT) {
      value = arg;
    } else if (type === FOType.ERROR) {
      hasError = true;
      error = arg;
    }
    subject(type, arg, subs);
  }) as BehaviorSubject<T>;

  result = sourceAsSubject(result) as BehaviorSubject<T>;
  result.getValue = () => {
    if (hasError) throw error;
    return value;
  };
  return result;
}) as any;

