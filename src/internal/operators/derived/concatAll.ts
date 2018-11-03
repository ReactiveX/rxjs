import { mergeAll } from 'rxjs/internal/operators/derived/mergeAll';
import { identity } from 'rxjs/internal/util/identity';
import { OperatorFunction } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';

export const concatAll = <T extends Observable<R>, R>() => mergeAll<T, R>(1);
