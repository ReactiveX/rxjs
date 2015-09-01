import Observable from '../Observable';
import { FlatMapToOperator } from './flatMapTo-support';

export default function concatMapTo<T, R>(observable: Observable<any>,
                                          projectResult?: (x: T, y: any, ix: number, iy: number) => R) : Observable<R> {
  return this.lift(new FlatMapToOperator(observable, projectResult, 1));
}
