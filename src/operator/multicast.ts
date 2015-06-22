import Observable from '../Observable';
import Subject from '../Subject';
import ConnectableObservable from '../ConnectableObservable';

export default function multicast(subject:Subject) : ConnectableObservable {
  return new ConnectableObservable(this, subject);
};