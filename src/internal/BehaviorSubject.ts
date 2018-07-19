import { Subject, subjectSource } from "rxjs/internal/Subject";
import { FOType, FObsArg } from "rxjs/internal/types";
import { Subscription } from "rxjs/internal/Subscription";
import { sourceAsObservable } from "./Observable";
import { sourceAsSubject } from "rxjs/internal/util/subjectBase";


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

