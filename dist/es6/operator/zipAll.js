import Observable from '../Observable';
export default function zipAll(project) {
    return this.toArray().flatMap(observables => Observable.zip(observables, project));
}
