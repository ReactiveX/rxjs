import { of, asyncScheduler } from 'rxjs';
import { bufferTime } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(bufferTime(1)); // $ExpectType Observable<number[]>
  const p = of(1, 2, 3).pipe(bufferTime(1, asyncScheduler)); // $ExpectType Observable<number[]>
});

it('should support a bufferCreationInterval', () => {
  const o = of(1, 2, 3).pipe(bufferTime(1, 6)); // $ExpectType Observable<number[]>
  const p = of(1, 2, 3).pipe(bufferTime(1, 6, asyncScheduler)); // $ExpectType Observable<number[]>
  const q = of(1, 2, 3).pipe(bufferTime(1, undefined)); // $ExpectType Observable<number[]>
  const r = of(1, 2, 3).pipe(bufferTime(1, null)); // $ExpectType Observable<number[]>
});

it('should support a maxBufferSize', () => {
  const o = of(1, 2, 3).pipe(bufferTime(1, 6, 3)); // $ExpectType Observable<number[]>
  const p = of(1, 2, 3).pipe(bufferTime(1, 6, 3, asyncScheduler)); // $ExpectType Observable<number[]>
  const q = of(1, 2, 3).pipe(bufferTime(1, undefined, 3)); // $ExpectType Observable<number[]>
  const r = of(1, 2, 3).pipe(bufferTime(1, null, 3)); // $ExpectType Observable<number[]>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(bufferTime()); // $ExpectError
});

it('should enforce type of bufferTimeSpan', () => {
  const o = of(1, 2, 3).pipe(bufferTime('3')); // $ExpectError
});

it('should enforce type of scheduler', () => {
  const o = of(1, 2, 3).pipe(bufferTime(3, '3')); // $ExpectError
});

it('should enforce type of bufferCreationInterval', () => {
  const o = of(1, 2, 3).pipe(bufferTime(3, '3', asyncScheduler)); // $ExpectError
});

it('should enforce type of maxBufferSize', () => {
  const o = of(1, 2, 3).pipe(bufferTime(3, 3, '3', asyncScheduler)); // $ExpectError
});
