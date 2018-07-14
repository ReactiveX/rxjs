import { reduce } from './reduce';

export const toArray = <T>() => reduce<T, T[]>((arr, value) => (arr.push(value), arr), []);
