import { SubjectLike, ObservableInput } from '../types';
import { Observable } from '../observable/Observable';

export function multicast<T, R>(
  subjectOrFactory: SubjectLike<T>|(() => SubjectLike<T>),
  processor?: (casted: Observable<T>) => ObservableInput<R>
) {
  throw new Error('not implemented yet'); // womp womp
}