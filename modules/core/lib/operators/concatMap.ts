import { mergeMap } from './mergeMap';
import { FObs } from '../types';

export function concatMap<T, R>(project: (value: T) => FObs<R>) {
  return mergeMap(project, 1);
}