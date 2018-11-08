import { of } from 'rxjs';
import { bufferCount } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(bufferCount(1)); // $ExpectType Observable<number[]>
  const p = of(1, 2, 3).pipe(bufferCount(1, 7)); // $ExpectType Observable<number[]>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(bufferCount()); // $ExpectError
});

it('should enforce type of bufferSize', () => {
  const o = of(1, 2, 3).pipe(bufferCount('7')); // $ExpectError
});

it('should enforce type of startBufferEvery', () => {
  const o = of(1, 2, 3).pipe(bufferCount(1, '7')); // $ExpectError
});
