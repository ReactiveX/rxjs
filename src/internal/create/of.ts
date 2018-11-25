import { Observable } from 'rxjs/internal/Observable';

/* tslint:disable:max-line-length */
export function of<T>(a: T): Observable<T>;
export function of<T, B>(a: T, b: B): Observable<T|B>;
export function of<T, B, C>(a: T, b: B, c: C): Observable<T|B|C>;
export function of<T, B, C, D>(a: T, b: B, c: C, d: D): Observable<T|B|C|D>;
export function of<T, B, C, D, E>(a: T, b: B, c: C, d: D, e: E): Observable<T|B|C|D|E>;
export function of<T, B, C, D, E, F>(a: T, b: B, c: C, d: D, e: E, f: F): Observable<T|B|C|D|E|F>;
export function of<T, B, C, D, E, F, G>(a: T, b: B, c: C, d: D, e: E, f: F, g: G):
  Observable<T|B|C|D|E|F|G>;
export function of<T, B, C, D, E, F, G, H>(a: T, b: B, c: C, d: D, e: E, f: F, g: G, h: H):
  Observable<T|B|C|D|E|F|G|H>;
export function of<T, B, C, D, E, F, G, H, I>(a: T, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I):
  Observable<T|B|C|D|E|F|G|H|I>;
export function of<T>(...values: T[]): Observable<T>;
/* tslint:enable:max-line-length */

export function of<T>(...values: T[]): Observable<T> {
  return new Observable<T>(subscriber => {
    for (let i = 0; i < values.length && !subscriber.closed; i++) {
      subscriber.next(values[i]);
    }
    subscriber.complete();
  })
}
