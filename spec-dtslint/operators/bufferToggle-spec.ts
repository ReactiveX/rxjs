import { of, NEVER } from 'rxjs';
import { bufferToggle } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(bufferToggle(of('a', 'b', 'c'), value => of(new Date()))); // $ExpectType Observable<number[]>
});

it('should support Promises', () => {
  const promise = Promise.resolve('a');
  const o = of(1, 2, 3).pipe(bufferToggle(promise, value => of(new Date()))); // $ExpectType Observable<number[]>
  const p = of(1, 2, 3).pipe(bufferToggle(of('a', 'b', 'c'), value => promise)); // $ExpectType Observable<number[]>
  const q = of(1, 2, 3).pipe(bufferToggle(promise, value => promise)); // $ExpectType Observable<number[]>
});

it('should support NEVER', () => {
  const o = of(1, 2, 3).pipe(bufferToggle(NEVER, value => of(new Date()))); // $ExpectType Observable<number[]>
  const p = of(1, 2, 3).pipe(bufferToggle(of('a', 'b', 'c'), value => NEVER)); // $ExpectType Observable<number[]>
  const q = of(1, 2, 3).pipe(bufferToggle(NEVER, value => NEVER)); // $ExpectType Observable<number[]>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(bufferToggle()); // $ExpectError
});

it('should enforce type of openings', () => {
  const o = of(1, 2, 3).pipe(bufferToggle('a', () => of('a', 'b', 'c'))); // $ExpectError
});

it('should enforce type of closingSelector', () => {
  const o = of(1, 2, 3).pipe(bufferToggle(of('a', 'b', 'c'), 'a')); // $ExpectError
  const p = of(1, 2, 3).pipe(bufferToggle(of('a', 'b', 'c'), (value: number) => of('a', 'b', 'c'))); // $ExpectError
});
