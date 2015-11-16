import {Observable, ArrayOrIterator, ObservableOrPromise} from '../Observable';
import {merge as mergeStatic} from './merge-static';
import {Scheduler} from '../Scheduler';

export function merge<T>(concurrency: number): T;
export function merge<T>(scheduler: Scheduler, concurrency: number): T;
export function merge<T>(...observables: (ObservableOrPromise<T> | Scheduler | number)[]): Observable<T>;
export function merge<T>(...observables: (ArrayOrIterator<T> | Scheduler | number)[]): Observable<T>;
export function merge<T, R>(...observables: (ObservableOrPromise<T> | Scheduler | number)[]): Observable<R>;
export function merge<T, R>(...observables: (ArrayOrIterator<T> | Scheduler | number)[]): Observable<R>;
export function merge(...observables: any[]): Observable<any> {
  observables.unshift(this);
  return mergeStatic.apply(this, observables);
}
