import Observable from '../Observable';

export default function zip(observables:Array<Observable>, project:(...Observable)=>Observable) : Observable {
	return Observable.fromArray(observables).zipAll(project);
}