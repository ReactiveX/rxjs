import { of } from 'rxjs';
import { mergeMapTo } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(mergeMapTo(of('foo'))); // $ExpectType Observable<string>
});

it('should infer correctly multiple types', () => {
  const o = of(1, 2, 3).pipe(mergeMapTo(of('foo', 4))); // $ExpectType Observable<string | number>
});

it('should support a concurrent parameter', () => {
  const o = of(1, 2, 3).pipe(mergeMapTo(of('foo'), 4)); // $ExpectType Observable<string>
});

it('should infer correctly by using the resultSelector first parameter', () => {
  const o = of(1, 2, 3).pipe(mergeMapTo(of('foo'), a => a)); // $ExpectType Observable<number>
});

it('should infer correctly by using the resultSelector second parameter', () => {
  const o = of(1, 2, 3).pipe(mergeMapTo(of('foo'), (a, b) => b)); // $ExpectType Observable<string>
});

it('should support a resultSelector that takes an inner index', () => {
  const o = of(1, 2, 3).pipe(mergeMapTo(of('foo'), (a, b, innnerIndex) => a)); // $ExpectType Observable<number>
});

it('should support a resultSelector that takes an inner and outer index', () => {
  const o = of(1, 2, 3).pipe(mergeMapTo(of('foo'), (a, b, innnerIndex, outerIndex) => a)); // $ExpectType Observable<number>
});

it('should support a resultSelector and concurrent parameter', () => {
  const o = of(1, 2, 3).pipe(mergeMapTo(of('foo'), (a, b) => b, 4)); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(mergeMapTo()); // $ExpectError
});

it('should enforce the return type', () => {
  const o = of(1, 2, 3).pipe(mergeMapTo(p => p)); // $ExpectError
});

it('should enforce types of the concurrent parameter', () => {
  const o = of(1, 2, 3).pipe(mergeMapTo(of('foo'), '4')); // $ExpectError
});

it('should enforce types of the concurrent parameter with a resultSelector', () => {
  const o = of(1, 2, 3).pipe(mergeMapTo(of('foo'), (a => a), '4')); // $ExpectError
});
