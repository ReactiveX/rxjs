import { of, asyncScheduler, Observable } from 'rxjs';
import { publishReplay } from 'rxjs/operators';

it('should accept empty parameter', () => {
  const a = of(1, 2, 3).pipe(publishReplay()); // $ExpectType Observable<number>
});

it('should accept bufferSize parameter only', () => {
  const a = of(1, 2, 3).pipe(publishReplay(1)); // $ExpectType Observable<number>
});

it('should accept windowTime and bufferSize', () => {
  const a = of(1, 2, 3).pipe(publishReplay(1, 1)); // $ExpectType Observable<number>
});

it('should accept windowTime, bufferSize, scheduler', () => {
  const a = of(1, 2, 3).pipe(publishReplay(1, 1, asyncScheduler)); // $ExpectType Observable<number>
});

it('should accept windowTime, bufferSize, selector of OperatorFunction', () => {
  const a = of(1, 2, 3).pipe(publishReplay(1, 1, (x) => of('a'))); // $ExpectType Observable<string>
});

it('should accept windowTime, bufferSize, selector  of MonoTypeOperatorFunction', () => {
  const a = of(1, 2, 3).pipe(publishReplay(1, 1, (x) => x)); // $ExpectType Observable<number>
});

it('should accept windowTime, bufferSize, selector of OperatorFunction, and scheduler', () => {
  const a = of(1, 2, 3).pipe(publishReplay(1, 1, (x) => of('a'), asyncScheduler)); // $ExpectType Observable<string>
});

it('should accept windowTime, bufferSize, selector of MonoTypeOperatorFunction, and scheduler', () => {
  const a = of(1, 2, 3).pipe(publishReplay(1, 1, (x) => x, asyncScheduler)); // $ExpectType Observable<number>
});

it('should enforce type on selector', () => {
  const a = of(1, 2, 3).pipe(publishReplay(1, 1, (x: Observable<string>) => x)); // $ExpectError
});
