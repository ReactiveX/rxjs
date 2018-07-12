import { mergeMap } from './mergeMap';
import { identity } from '../util/identity';
import { Operation } from '../types';
import { Observable } from '../Observable';

export const mergeAll = <T extends Observable<R>, R>(concurrent = Number.POSITIVE_INFINITY) => mergeMap<T, R>(identity, concurrent);
