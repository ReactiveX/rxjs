import Observable from '../Observable';
import {FlatMapToOperator} from './flatMapTo';

export default function concatMapTo<T, R>(observable: Observable<any>,
                                          projectResult?: (x: T, y: any, ix: number, iy: number) => R) {
  return this.lift(new FlatMapToOperator(observable, projectResult, 1));
}
