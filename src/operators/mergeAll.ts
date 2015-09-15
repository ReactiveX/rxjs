import Observable from '../Observable';
import Operator from '../Operator';
import Subscriber from '../Subscriber';
import Observer from '../Observer';
import Subscription from '../Subscription';
import { MergeAllOperator } from './mergeAll-support';

export default function mergeAll<R>(concurrent: number = Number.POSITIVE_INFINITY): Observable<R> {
  return this.lift(new MergeAllOperator(concurrent));
}