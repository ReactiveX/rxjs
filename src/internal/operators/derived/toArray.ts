import { reduce } from 'rxjs/internal/operators/derived/reduce';

function toArrayReducer<T>(arr: T[], item: T, index: number) {
  if (index === 0) {
    return [item];
  }
  arr.push(item);
  return arr;
}

export function toArray<T>() {
  return reduce<T, T[]>(toArrayReducer, []);
}
