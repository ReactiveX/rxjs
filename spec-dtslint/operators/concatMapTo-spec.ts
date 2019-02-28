import { of } from 'rxjs';
import { concatMapTo } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(concatMapTo(of('foo'))); // $ExpectType Observable<string>
});

it('should infer correctly with multiple types', () => {
  const o = of(1, 2, 3).pipe(concatMapTo(of('foo', 4))); // $ExpectType Observable<string | number>
});

it('should infer correctly with an array', () => {
  const o = of(1, 2, 3).pipe(concatMapTo([4, 5, 6])); // $ExpectType Observable<number>
});

it('should infer correctly with a Promise', () => {
  const o = of(1, 2, 3).pipe(concatMapTo(new Promise<string>(() => {}))); // $ExpectType Observable<string>
});

it('should infer correctly by using the resultSelector first parameter', () => {
  const o = of(1, 2, 3).pipe(concatMapTo(of('foo'), a => a)); // $ExpectType Observable<number>
});

it('should infer correctly by using the resultSelector second parameter', () => {
  const o = of(1, 2, 3).pipe(concatMapTo(of('foo'), (a, b) => b)); // $ExpectType Observable<string>
});

it('should support a resultSelector that takes an inner index', () => {
  const o = of(1, 2, 3).pipe(concatMapTo(of('foo'), (a, b, innnerIndex) => a)); // $ExpectType Observable<number>
});

it('should support a resultSelector that takes an inner and outer index', () => {
  const o = of(1, 2, 3).pipe(concatMapTo(of('foo'), (a, b, innnerIndex, outerIndex) => a)); // $ExpectType Observable<number>
});

it('should support an undefined resultSelector', () => {
  const o = of(1, 2, 3).pipe(concatMapTo(of('foo'), undefined)); // $ExpectType Observable<string>
});

it('should support union types', () => {
  const s = Math.random() > 0.5 ? of(123) : of('abc');
  const r = of(1, 2, 3).pipe(concatMapTo(s)); // $ExpectType<string | number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(concatMapTo()); // $ExpectError
});

it('should enforce the return type', () => {
  const o = of(1, 2, 3).pipe(concatMapTo(p => p)); // $ExpectError
  const p = of(1, 2, 3).pipe(concatMapTo(4)); // $ExpectError
});
