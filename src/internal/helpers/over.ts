import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { OperatorFunction, ObservableInput } from '../types';
import { map } from '../operators/map';
import { from } from '../observable/from';

export function over<O, I, R>(
  selector: (outer: O, index: number) => ObservableInput<I>,
  project: (outerValue: O, innerValue: I, outerIndex: number, innerIndex: number) => R): (outer: O, index: number) => Observable<R> {
  return (outer, outerIndex) => from(selector(outer, outerIndex))
    .pipe(map((inner, innerIndex) => project(outer, inner, outerIndex, innerIndex)));
}