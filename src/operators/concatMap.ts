import Observable from '../Observable';
import { MergeMapOperator } from './mergeMap-support';

export default function concatMap<T, R>(project: (x: T, ix: number) => Observable<any>,
                                        projectResult?: (x: T, y: any, ix: number, iy: number) => R) {
  return this.lift(new MergeMapOperator(project, projectResult, 1));
}
