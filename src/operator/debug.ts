import { Observable } from '../Observable';

import { _do } from './do';

/**
 * Debug your Observable values using `do`
 *
 * @example
 * Rx.Observable.of(1, 2, 3).debug('debug').subscribe()
 *
 * @see {@link do}
 *
 * @method debug
 * @name debug
 * @owner Observable
 */
export function debug<T>(this: Observable<T>,
                         nextMsg: string = '',
                         errorMsg?: string,
                         completeMsg?: string): Observable<T> {

  return _do.call(
    this,
    console.log.bind(console, nextMsg),
    console.error.bind(console, errorMsg || nextMsg),
    console.info.bind(console, completeMsg || nextMsg)
  )
}
