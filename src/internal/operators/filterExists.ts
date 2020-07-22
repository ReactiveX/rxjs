import { MonoTypeOperatorFunction } from 'rxjs';

import { filter } from './filter';

/**
 * Filter items emitted by the source Observable by only emitting those that
 * contains a valid value 
 * 
 * <span class="informal">Like {@link filter}, but it only emits a value from the source if it is not nullable.</span>
 * 
 * ![](filterExists.png)
 *
 * It uses the `filter` operator to perform the operation and emittin the values that is
 * different of `NaN`, `undefined`, `null`, `false`, empty Arrays, objects or strings
 *
 * ## Example
 * Filtering an empty response
 * ```ts
 * import { ajax } from 'rxjs/ajax';
 * import { filterExists } from 'rxjs/operators';
 *
 * const source = ajax(`https://api.github.com/users?per_page=5`);
 * const validResponse = source.pipe(filterExists());
 * validResponse.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link filter}
 *
 */
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
