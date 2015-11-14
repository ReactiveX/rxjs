import {Observable, ObservableOrPromise, ArrayOrIterator} from './Observable';
export type _Selector<T, TResult> =	(value: T) => TResult;
export type _IndexSelector<T, TResult> = (value: T, index: number) => TResult;	
export type _SwitchMapResultSelector<T1, T2, TResult> = (outerValue: T1, innerValue: T2, outerIndex: number, innerIndex: number) => TResult;
export type _ObservableMergeMapProjector<T, R> = (value: T, index: number) => ObservableOrPromise<R>;
export type _IteratorMergeMapProjector<T, R> = (value: T, index: number) => ArrayOrIterator<R>;

export type _Predicate<T> = _Selector<T, boolean>;
export type _PredicateObservable<T> = (value: T, index: number, observable: Observable<T>) => boolean;	

export type _Comparer<T, TResult> = (value1: T, value2: T) => TResult;
export type _Accumulator<T, TAcc> = (acc: TAcc, value: T) => TAcc;
export type _MergeAccumulator<T, TAcc> = (acc: TAcc, value: T) => Observable<TAcc>;
