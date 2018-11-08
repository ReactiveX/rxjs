import { of, asyncScheduler } from 'rxjs';
import { timeout } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of('a', 'b', 'c').pipe(timeout(10)); // $ExpectType Observable<string>
});

it('should support a date', () => {
  const o = of('a', 'b', 'c').pipe(timeout(new Date())); // $ExpectType Observable<string>
});

it('should support a scheduler', () => {
  const o = of('a', 'b', 'c').pipe(timeout(10, asyncScheduler)); // $ExpectType Observable<string>
  const p = of('a', 'b', 'c').pipe(timeout(new Date(), asyncScheduler)); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of('a', 'b', 'c').pipe(timeout()); // $ExpectError
});

it('should enforce types of due', () => {
  const o = of('a', 'b', 'c').pipe(timeout('foo')); // $ExpectError
});

it('should enforce types of scheduler', () => {
  const o = of('a', 'b', 'c').pipe(timeout(5, 'foo')); // $ExpectError
});
