import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { bufferCount } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferCount(1)));
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferCount(1, 7)));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(bufferCount()));
});

it('should enforce type of bufferSize', () => {
  expectError(of(1, 2, 3).pipe(bufferCount('7')));
});

it('should enforce type of startBufferEvery', () => {
  expectError(of(1, 2, 3).pipe(bufferCount(1, '7')));
});
