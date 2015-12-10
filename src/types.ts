import {Observable} from './Observable';
export type ObservableOrPromise<T> = Observable<T> | Promise<T>;
export type ArrayOrIterator<T> = Iterator<T> | ArrayLike<T> | Array<T>;
export type ObservableInput<T> = Observable<T> | Promise<T> | Iterator<T> | ArrayLike<T>;

export type _Factory<T> = () => T;
export type _Selector<T, TResult> = (value: T) => TResult;
export type _IndexSelector<T, TResult> = (value: T, index: number) => TResult;
export type _RestSelector<T> = (...values: Array<any>) => T;
export type _OuterInnerMapResultSelector<T1, T2, TResult> = (outerValue: T1, innerValue: T2, outerIndex: number, innerIndex: number) => TResult;

export type _Predicate<T> = _Selector<T, boolean>;
export type _IndexPredicate<T> = _IndexSelector<T, boolean>;
export type _PredicateObservable<T> = (value: T, index: number, observable: Observable<T>) => boolean;

export type _Comparer<T, TResult> = (value1: T, value2: T) => TResult;
export type _Accumulator<T, TAcc> = (acc: TAcc, value: T) => TAcc;
export type _MergeAccumulator<T, TAcc> = (acc: TAcc, value: T) => Observable<TAcc>;
