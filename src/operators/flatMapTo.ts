import Operator from '../Operator';
import Observer from '../Observer';
import Observable from '../Observable';
import Subscriber from '../Subscriber';

import { FlatMapToOperator } from './flatMapTo-support';

export default function flatMapTo<T, R>(observable: Observable<any>,
                                        projectResult?: (x: T, y: any, ix: number, iy: number) => R,
                                        concurrent?: number) {
  return this.lift(new FlatMapToOperator(observable, projectResult, concurrent));
}