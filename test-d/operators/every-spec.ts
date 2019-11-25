import { of, Observable, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { every } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<boolean>>(of(1, 2, 3).pipe(every(val => val < 3)));
});

it('should support index and its type', () => {
  expectType<Observable<boolean>>(of(1, 2, 3).pipe(every((val, index: number) => val < 3)));
});

it('should support index and its type', () => {
  expectType<Observable<boolean>>(of(1, 2, 3).pipe(every((val, index: number) => index < 3)));
});

it('should infer source observable type in parameter', () => {
  expectType<Observable<boolean>>(of(1, 2, 3).pipe(every((val, index, source: Observable<number>) => val < 3)));
});

it('should support optional thisArg parameter', () => {
  expectType<Observable<boolean>>(of(1, 2, 3).pipe(every((val, index, source: Observable<number>) => val < 3, 'any object')));
});

it('should not accept empty parameter', () => {
  expectError(of(1, 2, 3).pipe(every()));
});

it('should support source type', () => {
  expectError(of(1, 2, 3).pipe(every((val) => val === '2')));
});

it('should enforce index type of number', () => {
  expectError(of(1, 2, 3).pipe(every((val, i) => i === '3')));
});

it('should expect function parameter', () => {
  expectError(of(1, 2, 3).pipe(every(9)));
});
