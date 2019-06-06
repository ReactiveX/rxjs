import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { ConnectableObservable } from '../observable/ConnectableObservable';

export function multicast<T>(source: Observable<T>, subjectOrSubjectFactory?: (() => Subject<T>) | Subject<T>) {
  const subjectFactory = (typeof subjectOrSubjectFactory === 'function') ? subjectOrSubjectFactory : () => subjectOrSubjectFactory;
  return new ConnectableObservable(source, subjectFactory);
}
