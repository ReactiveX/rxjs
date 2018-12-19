import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { identity } from 'rxjs/internal/util/identity';
import { ObservableInput } from 'rxjs/internal/types';

export const mergeAll = <T extends ObservableInput<R>, R>(concurrent = Number.POSITIVE_INFINITY) => mergeMap<T, R>(identity, concurrent);
