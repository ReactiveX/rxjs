import ArrayObservable from './ArrayObservable';
export default function fromArray(array) {
    return new ArrayObservable(array);
}
