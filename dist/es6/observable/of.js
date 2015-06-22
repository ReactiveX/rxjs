import ArrayObservable from './ArrayObservable';
export default function of(...values) {
    return new ArrayObservable(values);
}
;
