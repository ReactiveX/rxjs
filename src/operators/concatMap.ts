import Observable from '../Observable';
import { FlatMapOperator } from './flatMap-support'; 

export default function concatMap<T, R>(project: (x: T, ix: number) => Observable<any>,
                                        projectResult?: (x: T, y: any, ix: number, iy: number) => R) {
  return this.lift(new FlatMapOperator(project, projectResult, 1));
}
