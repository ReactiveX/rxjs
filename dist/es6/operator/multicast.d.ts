import Subject from '../Subject';
import ConnectableObservable from '../ConnectableObservable';
export default function multicast(subjectFactory: () => Subject): ConnectableObservable;
