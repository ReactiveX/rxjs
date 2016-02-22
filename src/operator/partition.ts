import {not} from '../util/not';
import {filter} from './filter';
import {Observable} from '../Observable';

/**
 * @param predicate
 * @param thisArg
 * @return {Observable<T>[]}
 * @method partition
 * @owner Observable
 */
export function partition<T>(predicate: (value: T) => boolean, thisArg?: any): [Observable<T>, Observable<T>] {
  return [
    filter.call(this, predicate),
    filter.call(this, not(predicate, thisArg))
  ];
}

export interface PartitionSignature<T> {
  (predicate: (value: T) => boolean, thisArg?: any): [Observable<T>, Observable<T>];
}
