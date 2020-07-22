import { MonoTypeOperatorFunction } from 'rxjs';

import { filter } from './filter';

export function filterExists<T>(): MonoTypeOperatorFunction<T> {
  return filter((value: any): boolean =>{
    switch (true) {
      case !Boolean(value):
        return Boolean(value);
      case typeof value === 'boolean':
        return Boolean(value);
      case typeof value === 'string':
        return Boolean(value.trim());
      case Array.isArray(value):
        return (value as any[]).length > 0;
      case typeof value === 'object':
        return Object.keys(value).length > 0;
      default:
        return Boolean(value);
    }
  });
}
