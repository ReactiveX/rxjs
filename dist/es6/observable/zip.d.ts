import Observable from '../Observable';
export default function zip(observables: Array<Observable>, project: (...observables: Array<Observable>) => Observable): Observable;
