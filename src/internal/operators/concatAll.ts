import { mergeAll } from './mergeAll';
import { identity } from '../util/identity';
import { Operation } from '../types';
import { Observable } from '../Observable';

export const concatAll = <T extends Observable<R>, R>() => mergeAll<T, R>(1);
