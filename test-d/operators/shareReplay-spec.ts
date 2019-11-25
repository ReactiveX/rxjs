import { of, asyncScheduler , Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { shareReplay } from 'rxjs/operators';

it('should accept an individual bufferSize parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(shareReplay(1)));
});

it('should accept individual bufferSize and windowTime parameters', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(shareReplay(1, 2)));
});

it('should accept individual bufferSize, windowTime and scheduler parameters', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(shareReplay(1, 2, asyncScheduler)));
});

it('should accept a bufferSize config parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(shareReplay({ bufferSize: 1, refCount: true })));
});

it('should accept bufferSize and windowTime config parameters', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(shareReplay({ bufferSize: 1, windowTime: 2, refCount: true })));
});

it('should accept bufferSize, windowTime and scheduler config parameters', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(shareReplay({ bufferSize: 1, windowTime: 2, scheduler: asyncScheduler, refCount: true })));
});

it('should require a refCount config parameter', () => {
  expectError(of(1, 2, 3).pipe(shareReplay({ bufferSize: 1 })));
});
