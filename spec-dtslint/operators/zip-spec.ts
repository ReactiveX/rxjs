import { of } from 'rxjs';
import { zip } from 'rxjs/operators';

it('should support observables', () => {
  const o = of(1); // $ExpectType Observable<number>
  const a = o.pipe(zip(of(2))); // $ExpectType Observable<[number, number]>
});

it('should support rest parameter observables', () => {
  const o = of(1); // $ExpectType Observable<number>
  const z = [of(2)]; // $ExpectType Observable<number>[]
  const a = o.pipe(zip(...z)); // $ExpectType Observable<[arg: number, ...rest: number[]]>
});

it('should support projected rest parameter observables', () => {
  const o = of(1); // $ExpectType Observable<number>
  const z = [of(2)]; // $ExpectType Observable<number>[]
  const a = o.pipe(zip(...z, (...r) => r.map(v => v.toString()))); // $ExpectType Observable<string[]>
});

it('should support projected arrays of observables', () => {
  const o = of(1); // $ExpectType Observable<number>
  const z = [of(2)]; // $ExpectType Observable<number>[]
  const a = o.pipe(zip(z, (...r: any[]) => r.map(v => v.toString()))); // $ExpectType Observable<any[]>
});
