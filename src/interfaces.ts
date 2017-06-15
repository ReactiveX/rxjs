import { Observable } from './Observable';

export type UnaryFunction<T, R> = (source: T) => R;

export type OperatorFunction<T, R> = UnaryFunction<Observable<T>, Observable<R>>;
