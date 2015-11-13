import {not} from '../util/not';
import {filter} from './filter';
import {Observable} from '../Observable';
import {_Predicate} from '../types';

export function partition<T>(predicate: _Predicate<T>, thisArg?: any): Observable<[T, T]> {
  return <any>[
    filter.call(this, predicate),
    filter.call(this, not(predicate, thisArg))
  ];
}
