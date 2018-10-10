import { of, asyncScheduler } from 'rxjs';
import { endWith } from 'rxjs/operators';

it('should support a scheduler', () => {
  const a = of(1, 2, 3).pipe(endWith(asyncScheduler)); // $ExpectType Observable<number>
});

it('should infer type for 1 parameter', () => {
  const a = of(1, 2, 3).pipe(endWith(4)); // $ExpectType Observable<number>
});

it('should infer type for 2 parameter', () => {
  const a = of(1, 2, 3).pipe(endWith(4, 5)); // $ExpectType Observable<number>
});

it('should infer type for 3 parameter', () => {
  const a = of(1, 2, 3).pipe(endWith(4, 5, 6)); // $ExpectType Observable<number>
});

it('should infer type for 4 parameter', () => {
  const a = of(1, 2, 3).pipe(endWith(4, 5, 6, 7)); // $ExpectType Observable<number>
});

it('should infer type for 5 parameter', () => {
  const a = of(1, 2, 3).pipe(endWith(4, 5, 6, 7, 8)); // $ExpectType Observable<number>
});

it('should infer type for 6 parameter', () => {
  const a = of(1, 2, 3).pipe(endWith(4, 5, 6, 7, 8, 9)); // $ExpectType Observable<number>
});

it('should infer type for rest parameters', () => {
  const a = of(1, 2, 3).pipe(endWith(4, 5, 6, 7, 8, 9, 10)); // $ExpectType Observable<number>
});

it('should infer with different types', () => {
  const a = of(1, 2, 3).pipe(endWith('4', true)); // $ExpectType Observable<string | number | boolean>
});

it('should accept empty parameter', () => {
  const a = of(1, 2, 3).pipe(endWith()); // $ExpectType Observable<number>
});
