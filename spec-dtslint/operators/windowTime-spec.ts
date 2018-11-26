import { of, asyncScheduler } from 'rxjs';
import { windowTime } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of('a', 'b', 'c').pipe(windowTime(10)); // $ExpectType Observable<Observable<string>>
  const p = of('a', 'b', 'c').pipe(windowTime(10, asyncScheduler)); // $ExpectType Observable<Observable<string>>
});

it('should support a windowCreationInterval', () => {
  const o = of('a', 'b', 'c').pipe(windowTime(10, 30)); // $ExpectType Observable<Observable<string>>
  const p = of('a', 'b', 'c').pipe(windowTime(10, 30, asyncScheduler)); // $ExpectType Observable<Observable<string>>
});

it('should support a maxWindowSize', () => {
  const o = of('a', 'b', 'c').pipe(windowTime(10, 30, 80)); // $ExpectType Observable<Observable<string>>
  const p = of('a', 'b', 'c').pipe(windowTime(10, 30, 80, asyncScheduler)); // $ExpectType Observable<Observable<string>>
});

it('should enforce types', () => {
  const o = of('a', 'b', 'c').pipe(windowTime()); // $ExpectError
});

it('should enforce windowTimeSpan type', () => {
  const o = of('a', 'b', 'c').pipe(windowTime('nope')); // $ExpectError
});

it('should enforce windowCreationInterval type', () => {
  const o = of('a', 'b', 'c').pipe(windowTime(10, 'nope')); // $ExpectError
});

it('should enforce maxWindowSize type', () => {
  const o = of('a', 'b', 'c').pipe(windowTime(10, 30, 'nope')); // $ExpectError
});

it('should enforce scheduler type', () => {
  const o = of('a', 'b', 'c').pipe(windowTime(10, 30, 50, 'nope')); // $ExpectError
});
