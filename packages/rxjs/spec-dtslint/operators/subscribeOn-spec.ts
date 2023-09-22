import { of, asyncScheduler } from 'rxjs';
import { subscribeOn } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of('a', 'b', 'c').pipe(subscribeOn(asyncScheduler)); // $ExpectType Observable<string>
});

it('should support a delay ', () => {
  const o = of('a', 'b', 'c').pipe(subscribeOn(asyncScheduler, 7)); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of('a', 'b', 'c').pipe(subscribeOn()); // $ExpectError
});

it('should enforce scheduler type', () => {
  const o = of('a', 'b', 'c').pipe(subscribeOn('nope')); // $ExpectError
});

it('should enforce delay type', () => {
  const o = of('a', 'b', 'c').pipe(subscribeOn(asyncScheduler, 'nope')); // $ExpectError
});
