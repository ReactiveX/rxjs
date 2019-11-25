import { of, asyncScheduler , Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { startWith } from 'rxjs/operators';

it('should infer correctly with one value', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(startWith(4)));
});

it('should infer correctly with multiple values', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(startWith(4, 5, 6)));
});

it('should infer correctly with no value', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(startWith()));
});

it('should infer correctly with a value and a scheduler', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(startWith(5, asyncScheduler)));
});

it('should infer correctly with a different type', () => {
  expectType<Observable<string | number>>(of(1, 2, 3).pipe(startWith('foo')));
});

it('should infer correctly with multiple different types', () => {
  expectType<Observable<string | number | boolean>>(of(1, 2, 3).pipe(startWith('foo', 4, true)));
});

it('should infer correctly with only a scheduler', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(startWith(asyncScheduler)));
});
