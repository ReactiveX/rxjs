import { of, asyncScheduler  } from 'rxjs';
import { startWith } from 'rxjs/operators';

it('should infer correctly with one value', () => {
  const o = of(1, 2, 3).pipe(startWith(4)); // $ExpectType Observable<number>
});

it('should infer correctly with multiple values', () => {
  const o = of(1, 2, 3).pipe(startWith(4, 5, 6)); // $ExpectType Observable<number>
});

it('should infer correctly with no value', () => {
  const o = of(1, 2, 3).pipe(startWith()); // $ExpectType Observable<number>
});

it('should infer correctly with a value and a scheduler', () => {
  const o = of(1, 2, 3).pipe(startWith(5, asyncScheduler)); // $ExpectType Observable<number>
});

it('should infer correctly with only a scheduler', () => {
  const o = of(1, 2, 3).pipe(startWith(asyncScheduler)); // $ExpectType Observable<number>
});

it('should enforce types with one value', () => {
  const o = of(1, 2, 3).pipe(startWith('foo')); // $ExpectError
});

it('should enforce types with multiple value', () => {
  const o = of(1, 2, 3).pipe(startWith(4, 'foo')); // $ExpectError
});
