import map from './map';
import mergeAll from './mergeAll';
import Observable from '../Observable';

export default function flatMap(project: any, concurrent: number = Number.POSITIVE_INFINITY): Observable {
  return mergeAll.call(map.call(this, project), concurrent);
}