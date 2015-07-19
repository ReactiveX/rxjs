import Observable from '../Observable';
export default function combineLatest(observables: Array<Observable>, project: (...observables: Array<Observable>) => Observable): Observable;
