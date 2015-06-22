import ConnectableObservable from '../ConnectableObservable';
export default function multicast(subject) {
    return new ConnectableObservable(this, subject);
}
;
