import ConnectableObservable from '../ConnectableObservable';
export default function multicast(subjectFactory) {
    return new ConnectableObservable(this, subjectFactory);
}
;
