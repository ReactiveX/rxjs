import Observable from '../Observable';
import { FlatMapOperator } from './flatMap-support';

export default function flatMap<T, R>(project: (x: T, ix: number) => Observable<any>,
                                      projectResult?: (x: T, y: any, ix: number, iy: number) => R,
                                      concurrent?: number) {
  return this.lift(new FlatMapOperator(project, projectResult, concurrent));
}