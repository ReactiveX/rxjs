import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { identity } from 'rxjs/internal/util/identity';
import { OperatorFunction } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';

export const mergeAll = <T extends Observable<R>, R>(concurrent = Number.POSITIVE_INFINITY) => mergeMap<T, R>(identity, concurrent);
