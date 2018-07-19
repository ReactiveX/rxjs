import { reduce } from 'rxjs/internal/operators/derived/reduce';

export const toArray = <T>() => reduce<T, T[]>((arr, value) => (arr.push(value), arr), []);
