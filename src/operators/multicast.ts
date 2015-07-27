import Subject from '../Subject';
import ConnectableObservable from '../observables/ConnectableObservable';

export default function multicast<T>(subjectFactory: () => Subject<T>) {
  return new ConnectableObservable(this, subjectFactory);
}
