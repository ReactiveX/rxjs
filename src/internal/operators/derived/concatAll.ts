import { mergeAll } from 'rxjs/internal/operators/derived/mergeAll';
import { ObservableInput } from 'rxjs/internal/types';

export const concatAll = <T extends ObservableInput<R>, R>() => mergeAll<T, R>(1);
