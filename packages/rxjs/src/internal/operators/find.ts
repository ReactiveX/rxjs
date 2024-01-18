import type { Subscriber} from '@rxjs/observable';
import { Observable, operate } from '@rxjs/observable';
import type { OperatorFunction, TruthyTypesOf } from '../types.js';

export function find<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export function find<T, S extends T>(
  predicate: (value: T, index: number, source: Observable<T>) => value is S
): OperatorFunction<T, S | undefined>;
export function find<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, T | undefined>;
/**
 * Emits only the first value emitted by the source Observable that meets some
 * condition.
 *
 * <span class="informal">Finds the first value that passes some test and emits
 * that.</span>
 *
 * ![](find.png)
 *
 * `find` searches for the first item in the source Observable that matches the
 * specified condition embodied by the `predicate`, and returns the first
 * occurrence in the source. Unlike {@link first}, the `predicate` is required
 * in `find`, and does not emit an error if a valid value is not found
 * (emits `undefined` instead).
 *
 * ## Example
 *
 * Find and emit the first click that happens on a DIV element
 *
 * ```ts
 * import { fromEvent, find } from 'rxjs';
 *
 * const div = document.createElement('div');
 * div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
 * document.body.appendChild(div);
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(find(ev => (<HTMLElement>ev.target).tagName === 'DIV'));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link filter}
 * @see {@link first}
 * @see {@link findIndex}
 * @see {@link take}
 *
 * @param predicate A function called with each item to test for condition matching.
 * @return A function that returns an Observable that emits the first item that
 * matches the condition.
 */
export function find<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, T | undefined> {
  return (source) => new Observable((subscriber) => createFind(predicate, 'value', source, subscriber));
}

export function createFind<T>(
  predicate: (value: T, index: number, source: Observable<T>) => boolean,
  emit: 'value' | 'index',
  source: Observable<T>,
  destination: Subscriber<any>
) {
  const findIndex = emit === 'index';
  let index = 0;
  source.subscribe(
    operate({
      destination,
      next: (value) => {
        const i = index++;
        if (predicate(value, i, source)) {
          destination.next(findIndex ? i : value);
          destination.complete();
        }
      },
      complete: () => {
        destination.next(findIndex ? -1 : undefined);
        destination.complete();
      },
    })
  );
}
