import { of, NEVER, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { bufferToggle } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferToggle(of('a', 'b', 'c'), value => of(new Date()))));
});

it('should support Promises', () => {
  const promise = Promise.resolve('a');
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferToggle(promise, value => of(new Date()))));
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferToggle(of('a', 'b', 'c'), value => promise)));
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferToggle(promise, value => promise)));
});

it('should support NEVER', () => {
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferToggle(NEVER, value => of(new Date()))));
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferToggle(of('a', 'b', 'c'), value => NEVER)));
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferToggle(NEVER, value => NEVER)));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(bufferToggle()));
});

it('should enforce type of openings', () => {
  expectError(of(1, 2, 3).pipe(bufferToggle('a', () => of('a', 'b', 'c'))));
});

it('should enforce type of closingSelector', () => {
  expectError(of(1, 2, 3).pipe(bufferToggle(of('a', 'b', 'c'), 'a')));
  expectError(of(1, 2, 3).pipe(bufferToggle(of('a', 'b', 'c'), (value: number) => of('a', 'b', 'c'))));
});
