import Observable from '../Observable';
export default function zip(observables, project) {
    return Observable.zip([this].concat(observables), project);
}
