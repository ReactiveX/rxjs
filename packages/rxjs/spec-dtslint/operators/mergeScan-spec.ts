import { of } from 'rxjs';
import { mergeScan } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(mergeScan((acc, value) => of(acc + value), 0)); // $ExpectType Observable<number>
});

it('should infer correctly by using the seed', () => {
  const o = of(1, 2, 3).pipe(mergeScan((acc, value) => of(acc + value), '')); // $ExpectType Observable<string>
});

it('should support the accumulator returning an iterable', () => {
  const o = of(1, 2, 3).pipe(mergeScan((acc, value) => acc + value, '')); // $ExpectType Observable<string>
});

it('should support the accumulator returning a promise', () => {
  const o = of(1, 2, 3).pipe(mergeScan(acc => Promise.resolve(acc), '')); // $ExpectType Observable<string>
});

it('should support a currency', () => {
  const o = of(1, 2, 3).pipe(mergeScan((acc, value) => of(acc + value), '', 47)); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(mergeScan()); // $ExpectError
});

it('should enforce accumulate types', () => {
  const o = of(1, 2, 3).pipe(mergeScan((acc: string, value) => of(acc + value), 0)); // $ExpectError
  const p = of(1, 2, 3).pipe(mergeScan((acc, value: string) => of(acc + value), 0)); // $ExpectError
});

it('should enforce accumulate return type', () => {
  const o = of(1, 2, 3).pipe(mergeScan((acc, value) => of(''), 0)); // $ExpectError
});

it('should enforce concurrent type', () => {
  const o = of(1, 2, 3).pipe(mergeScan((acc, value) => of(acc + value), 0, '')); // $ExpectError
});

// TODO(benlesh): It still seems we don't have a great way to do this in TS 3.2
// it('should support union types', () => {
//   const o = of(1, 2, 3).pipe(mergeScan(() => Math.random() > 0.5 ? of(123) : of('test'), 0)); // $ExpectType Observable<string | number>
// });
