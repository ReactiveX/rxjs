import { IScheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { defer } from './defer';
import { from } from './from';
//TODO: Use higher-order function `map` here.
import { map } from '../operator/map';

 /**
   * Convert an object into an observable sequence of [key, value] pairs
   * using an optional IScheduler to enumerate the object.
   *
   * @example <caption>Converts a javascript object to an Observable</caption>
   * var obj = {
   *   foo: 42,
   *   bar: 56,
   *   baz: 78
   * };
   *
   * var source = Rx.Observable.pairs(obj);
   *
   * var subscription = source.subscribe(
   *   function (x) {
   *     console.log('Next: %s', x);
   *   },
   *   function (err) {
   *     console.log('Error: %s', err);
   *   },
   *   function () {
   *     console.log('Completed');
   *   });
   *
   * @param {Object} obj The object to inspect and turn into an
   * Observable sequence.
   * @param {Scheduler} [scheduler] An optional IScheduler to run the
   * enumeration of the input sequence on.
   * @returns {(Observable<Array<string | T>>)} An observable sequence of
   * [key, value] pairs from the object.
   */
export const pairs = <T>(obj: Object, scheduler?: IScheduler): Observable<Array<string | T>> =>
  defer(() => {
    return map.call(from(Object.keys(obj)), (key: string) => [key, obj[key]]);
  });
