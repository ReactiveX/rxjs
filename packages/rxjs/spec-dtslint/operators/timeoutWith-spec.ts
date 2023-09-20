import { of, asyncScheduler } from 'rxjs';
import { timeoutWith } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of('a', 'b', 'c').pipe(timeoutWith(10, of(1, 2, 3))); // $ExpectType Observable<string | number>
  const p = of('a', 'b', 'c').pipe(timeoutWith(10, [1, 2, 3])); // $ExpectType Observable<string | number>
  const q = of('a', 'b', 'c').pipe(timeoutWith(10, Promise.resolve(5))); // $ExpectType Observable<string | number>
  const r = of('a', 'b', 'c').pipe(timeoutWith(10, new Set([1, 2, 3]))); // $ExpectType Observable<string | number>
  const s = of('a', 'b', 'c').pipe(timeoutWith(10, 'foo')); // $ExpectType Observable<string>
});

it('should infer correctly while having the same types', () => {
  const o = of('a', 'b', 'c').pipe(timeoutWith(10, of('x', 'y', 'z'))); // $ExpectType Observable<string>
});

it('should support a date', () => {
  const o = of('a', 'b', 'c').pipe(timeoutWith(new Date(), of(1, 2, 3))); // $ExpectType Observable<string | number>
  const p = of('a', 'b', 'c').pipe(timeoutWith(new Date(), [1, 2, 3])); // $ExpectType Observable<string | number>
  const q = of('a', 'b', 'c').pipe(timeoutWith(new Date(), Promise.resolve(5))); // $ExpectType Observable<string | number>
  const r = of('a', 'b', 'c').pipe(timeoutWith(new Date(), new Set([1, 2, 3]))); // $ExpectType Observable<string | number>
  const s = of('a', 'b', 'c').pipe(timeoutWith(new Date(), 'foo')); // $ExpectType Observable<string>
});

it('should support a scheduler', () => {
  const o = of('a', 'b', 'c').pipe(timeoutWith(10, of(1, 2, 3), asyncScheduler)); // $ExpectType Observable<string | number>
  const p = of('a', 'b', 'c').pipe(timeoutWith(new Date(), of(1, 2, 3), asyncScheduler)); // $ExpectType Observable<string | number>
});

it('should enforce types', () => {
  const o = of('a', 'b', 'c').pipe(timeoutWith()); // $ExpectError
});

it('should enforce types of due', () => {
  const o = of('a', 'b', 'c').pipe(timeoutWith('foo')); // $ExpectError
});

it('should enforce types of withObservable', () => {
  const o = of('a', 'b', 'c').pipe(timeoutWith(10, 10)); // $ExpectError
});

it('should enforce types of scheduler', () => {
  const o = of('a', 'b', 'c').pipe(timeoutWith(5, of(1, 2, 3), 'foo')); // $ExpectError
});
