import { of, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { bufferTime } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferTime(1)));
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferTime(1, asyncScheduler)));
});

it('should support a bufferCreationInterval', () => {
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferTime(1, 6)));
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferTime(1, 6, asyncScheduler)));
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferTime(1, undefined)));
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferTime(1, null)));
});

it('should support a maxBufferSize', () => {
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferTime(1, 6, 3)));
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferTime(1, 6, 3, asyncScheduler)));
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferTime(1, undefined, 3)));
  expectType<Observable<number[]>>(of(1, 2, 3).pipe(bufferTime(1, null, 3)));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(bufferTime()));
});

it('should enforce type of bufferTimeSpan', () => {
  expectError(of(1, 2, 3).pipe(bufferTime('3')));
});

it('should enforce type of scheduler', () => {
  expectError(of(1, 2, 3).pipe(bufferTime(3, '3')));
});

it('should enforce type of bufferCreationInterval', () => {
  expectError(of(1, 2, 3).pipe(bufferTime(3, '3', asyncScheduler)));
});

it('should enforce type of maxBufferSize', () => {
  expectError(of(1, 2, 3).pipe(bufferTime(3, 3, '3', asyncScheduler)));
});
