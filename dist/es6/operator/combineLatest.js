import Observable from '../Observable';
export default function combineLatest(observables, project) {
    return Observable.combineLatest([this].concat(observables), project);
}
