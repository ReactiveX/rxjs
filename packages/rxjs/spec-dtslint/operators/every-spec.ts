import { of, Observable } from 'rxjs';
import { every } from 'rxjs/operators';

it('should infer correctly', () => {
  const a = of(1, 2, 3).pipe(every(val => val < 3)); // $ExpectType Observable<boolean>
});

it('should support index and its type', () => {
  const a = of(1, 2, 3).pipe(every((val, index: number) => val < 3)); // $ExpectType Observable<boolean>
});

it('should support index and its type', () => {
  const a = of(1, 2, 3).pipe(every((val, index: number) => index < 3)); // $ExpectType Observable<boolean>
});

it('should infer source observable type in parameter', () => {
  const a = of(1, 2, 3).pipe(every((val, index, source: Observable<number>) => val < 3)); // $ExpectType Observable<boolean>
});

it('should support optional thisArg parameter', () => {
  const a = of(1, 2, 3).pipe(every((val, index, source: Observable<number>) => val < 3, 'any object')); // $ExpectType Observable<boolean>
});

it('should not accept empty parameter', () => {
  const a = of(1, 2, 3).pipe(every()); // $ExpectError
});

it('should support source type', () => {
  const a = of(1, 2, 3).pipe(every((val) => val === '2')); // $ExpectError
});

it('should enforce index type of number', () => {
  const a = of(1, 2, 3).pipe(every((val, i) => i === '3')); // $ExpectError
});

it('should expect function parameter', () => {
  const a = of(1, 2, 3).pipe(every(9)); // $ExpectError
});

it('should handle the Boolean constructor', () => {
  const a = of(0 as const, '' as const, false as const, null, undefined, -0 as const, 0n as const).pipe(every(Boolean)); // $ExpectType Observable<false>
  const b = of(0 as const, '' as const, 'hi there' as const, false as const, null, undefined, -0 as const, 0n as const).pipe(every(Boolean)); // $ExpectType Observable<boolean>
  const c = of('test' as const, true as const, 1 as const, [], {}).pipe(every(Boolean)); // $ExpectType Observable<boolean>
  const d = of(NaN, NaN, NaN).pipe(every(Boolean)); // $ExpectType Observable<boolean>
  const e = of(0, 1, 0).pipe(every(Boolean)); // $ExpectType Observable<boolean>
})

it('should support this', () => {
  const thisArg = { limit: 5 };
  const a = of(1, 2, 3).pipe(every(function (val) {
    const limit = this.limit; // $ExpectType number
    return val < limit;
  }, thisArg));
});

it('should deprecate thisArg usage', () => {
  const a = of(1, 2, 3).pipe(every(Boolean)); // $ExpectNoDeprecation
  const b = of(1, 2, 3).pipe(every(Boolean, {})); // $ExpectDeprecation
  const c = of(1, 2, 3).pipe(every((value) => Boolean(value))); // $ExpectNoDeprecation
  const d = of(1, 2, 3).pipe(every((value) => Boolean(value), {})); // $ExpectDeprecation
});