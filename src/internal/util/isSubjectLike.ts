import { isObservableLike } from "./isObservableLike";
import { isObserver } from "./isObserver";
import { Subject } from "../Subject";

export function isSubjectLike<T>(obj: any): obj is Subject<T> {
  return isObservableLike(obj) && isObserver(obj);
}
