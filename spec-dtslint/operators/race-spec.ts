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

it('should be possible to use nested arrays', () => {
  const o = of('a', 'b', 'c').pipe(race([of('x', 'y', 'z')])); // $ExpectType Observable<string>
});
