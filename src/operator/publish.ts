import ConnectableObservable from '../ConnectableObservable';
import Subject from '../Subject';

function subjectFactory() {
  return new Subject();
}

export default function publish(): ConnectableObservable {
  return this.multicast(subjectFactory);
}