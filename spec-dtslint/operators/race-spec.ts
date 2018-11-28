import { of } from 'rxjs';
import { race } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of('a', 'b', 'c').pipe(race()); // $ExpectType Observable<string>
});

it('should allow observables', () => {
  const o = of('a', 'b', 'c').pipe(race(of('x', 'y', 'z'))); // $ExpectType Observable<string>
  const p = of('a', 'b', 'c').pipe(race(of('x', 'y', 'z'), of('t', 'i', 'm'))); // $ExpectType Observable<string>
});

it('should allow an array of observables', () => {
  const o = of('a', 'b', 'c').pipe(race([of('x', 'y', 'z')])); // $ExpectType Observable<string>
  const p = of('a', 'b', 'c').pipe(race([of('x', 'y', 'z'), of('t', 'i', 'm')])); // $ExpectType Observable<string>
});

it('should be possible to provide a return type', () => {
  const o = of('a', 'b', 'c').pipe(race<string, number>([of(1, 2, 3)])); // $ExpectType Observable<number>
  const p = of('a', 'b', 'c').pipe(race<string, number>([of(1, 2, 3), of('t', 'i', 'm')])); // $ExpectType Observable<number>
  const q = of('a', 'b', 'c').pipe(race<string, number>(of(1, 2, 3), [of(1, 2, 3)])); // $ExpectType Observable<number>
  const r = of('a', 'b', 'c').pipe(race<string, number>([of(1, 2, 3)], of('t', 'i', 'm'))); // $ExpectType Observable<number>
});

it('should be possible to use nested arrays', () => {
  const o = of('a', 'b', 'c').pipe(race([of('x', 'y', 'z')])); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of('a', 'b', 'c').pipe(race('aa')); // $ExpectError
});

it('should enforce argument types when not provided ', () => {
  const o = of('a', 'b', 'c').pipe(race(of(1, 2, 3))); // $ExpectError
  const p = of('a', 'b', 'c').pipe(race([of(1, 2, 3)])); // $ExpectError
});
