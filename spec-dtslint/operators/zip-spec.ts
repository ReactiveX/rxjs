import { Observable, of } from 'rxjs';
import { zip } from 'rxjs/operators';

it('should support rest parameter observables', () => {
  const o = of(1); // $ExpectType Observable<number>
  const z = [of(2)]; // $ExpectType Observable<number>[]
  const a = o.pipe(zip(...z)); // $ExpectType Observable<{}>
});

it('should support rest parameter observables with type parameters', () => {
  const o = of(1); // $ExpectType Observable<number>
  const z = [of(2)]; // $ExpectType Observable<number>[]
  const a = o.pipe(zip<number, number[]>(...z)); // $ExpectType Observable<number[]>
});

it('should support projected rest parameter observables', () => {
  const o = of(1); // $ExpectType Observable<number>
  const z = [of(2)]; // $ExpectType Observable<number>[]
  const a = o.pipe(zip(...z, (...r) => r.map(v => v.toString()))); // $ExpectType Observable<string[]>
});

it('should support projected rest parameter observables with type parameters', () => {
  const o = of(1); // $ExpectType Observable<number>
  const z = [of(2)]; // $ExpectType Observable<number>[]
  const a = o.pipe(zip<number, string[]>(...z, (...r) => r.map(v => v.toString()))); // $ExpectType Observable<string[]>
});

it('should support projected arrays of observables', () => {
  const o = of(1); // $ExpectType Observable<number>
  const z = [of(2)]; // $ExpectType Observable<number>[]
  const a = o.pipe(zip(z, (...r: any[]) => r.map(v => v.toString()))); // $ExpectType Observable<any[]>
});

it('should support projected arrays of observables with type parameters', () => {
  const o = of(1); // $ExpectType Observable<number>
  const z = [of(2)]; // $ExpectType Observable<number>[]
  const a = o.pipe(zip<number, number, string[]>(z, (...r: any[]) => r.map(v => v.toString()))); // $ExpectType Observable<string[]>
});
