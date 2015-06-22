import Observable from '../Observable';
export default function merge(observables) {
    return Observable.fromArray([this].concat(observables)).mergeAll();
}
