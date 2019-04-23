import { of, asyncScheduler  } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

it('should accept an individual bufferSize parameter', () => {
  const o = of(1, 2, 3).pipe(shareReplay(1)); // $ExpectType Observable<number>
});

it('should accept individual bufferSize and windowTime parameters', () => {
  const o = of(1, 2, 3).pipe(shareReplay(1, 2)); // $ExpectType Observable<number>
});

it('should accept individual bufferSize, windowTime and scheduler parameters', () => {
  const o3 = of(1, 2, 3).pipe(shareReplay(1, 2, asyncScheduler)); // $ExpectType Observable<number>
});

it('should accept a bufferSize config parameter', () => {
  const o = of(1, 2, 3).pipe(shareReplay({ bufferSize: 1, refCount: true })); // $ExpectType Observable<number>
});

it('should accept bufferSize and windowTime config parameters', () => {
  const o = of(1, 2, 3).pipe(shareReplay({ bufferSize: 1, windowTime: 2, refCount: true })); // $ExpectType Observable<number>
});

it('should accept bufferSize, windowTime and scheduler config parameters', () => {
  const o = of(1, 2, 3).pipe(shareReplay({ bufferSize: 1, windowTime: 2, scheduler: asyncScheduler, refCount: true })); // $ExpectType Observable<number>
});

it('should require a refCount config parameter', () => {
  const o = of(1, 2, 3).pipe(shareReplay({ bufferSize: 1 })); // $ExpectError
});
