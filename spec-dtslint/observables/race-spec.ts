import { race, of } from 'rxjs';

it('should infer correctly with 1 parameter', () => {
  const a = of(1);
  const o = race(a); // $ExpectType Observable<number>
});

it('should infer correctly with multiple parameters of the same type', () => {
  const a = of(1);
  const b = of(2);
  const o = race(a, b); // $ExpectType Observable<number>
});

it('should support 2 parameters with different types', () => {
  const a = of(1);
  const b = of('a');
  const o = race(a, b); // $ExpectType Observable<string> | Observable<number>
});

it('should support 3 parameters with different types', () => {
  const a = of(1);
  const b = of('a');
  const c = of(true);
  const o = race(a, b, c); // $ExpectType Observable<string> | Observable<number> | Observable<boolean>
});

it('should support 4 parameters with different types', () => {
  const a = of(1);
  const b = of('a');
  const c = of(true);
  const d = of([1, 2, 3]);
  const o = race(a, b, c, d); // $ExpectType Observable<string> | Observable<number> | Observable<boolean> | Observable<number[]>
});

it('should support 5 parameters with different types', () => {
  const a = of(1);
  const b = of('a');
  const c = of(true);
  const d = of([1, 2, 3]);
  const e = of(['blah']);
  const o = race(a, b, c, d, e); // $ExpectType Observable<string> | Observable<number> | Observable<boolean> | Observable<number[]> | Observable<string[]>
});

it('should support 6 or more parameters of the same type', () => {
  const a = of(1);
  const o = race(a, a, a, a, a, a, a, a, a, a, a, a, a, a); // $ExpectType Observable<number>
});

it('should return {} for 6 or more arguments of different types', () => {
  const a = of(1);
  const b = of('a');
  const c = of(true);
  const d = of([1, 2, 3]);
  const e = of(['blah']);
  const f = of({ foo: 'bar' });
  const o = race(a, b, c, d, e, f); // $ExpectType Observable<{}>
});

it('should handle an array of observables', () => {
  const a = of(1);
  const b = of(2);
  const o = race([a, b]); // $ExpectType Observable<number>
});

it('should return {} for array of observables of different types', () => {
  const a = of(1);
  const b = of('test');
  const o = race([a, b]); // $ExpectType Observable<{}>
});
