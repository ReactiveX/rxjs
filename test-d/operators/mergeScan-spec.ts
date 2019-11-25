import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { mergeScan } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(mergeScan((acc, value) => of(acc + value), 0)));
});

it('should infer correctly by using the seed', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(mergeScan((acc, value) => of(acc + value), '')));
});

it('should support the accumulator returning an iterable', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(mergeScan((acc, value) => acc + value, '')));
});

it('should support the accumulator returning a promise', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(mergeScan(acc => Promise.resolve(acc), '')));
});

it('should support a currency', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(mergeScan((acc, value) => of(acc + value), '', 47)));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(mergeScan()));
});

it('should enforce accumulate types', () => {
  expectError(of(1, 2, 3).pipe(mergeScan((acc: string, value) => of(acc + value), 0)));
  expectError(of(1, 2, 3).pipe(mergeScan((acc, value: string) => of(acc + value), 0)));
});

it('should enforce accumulate return type', () => {
  expectError(of(1, 2, 3).pipe(mergeScan((acc, value) => of(''), 0)));
});

it('should enforce concurrent type', () => {
  expectError(of(1, 2, 3).pipe(mergeScan((acc, value) => of(acc + value), 0, '')));
});

// TODO(benlesh): It still seems we don't have a great way to do this in TS 3.2
// it('should support union types', () => {
expectType<Observable<string | number>>(of(1, 2, 3).pipe(mergeScan(() => Math.random() > 0.5 ? of(123) : of('test'), 0)));
// });
