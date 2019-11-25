import { of, asyncScheduler, Observable, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { publishReplay } from 'rxjs/operators';

it('should accept empty parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(publishReplay()));
});

it('should accept bufferSize parameter only', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(publishReplay(1)));
});

it('should accept windowTime and bufferSize', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(publishReplay(1, 1)));
});

it('should accept windowTime, bufferSize, scheduler', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(publishReplay(1, 1, asyncScheduler)));
});

it('should accept windowTime, bufferSize, selector of OperatorFunction', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(publishReplay(1, 1, (x) => of('a'))));
});

it('should accept windowTime, bufferSize, selector returning union type', () => {
  expectType<Observable<string | number>>(of(1, 2, 3).pipe(publishReplay(1, 1,  () => Math.random() > 0.5 ? of(123) : of('test'))));
});

it('should accept windowTime, bufferSize, selector  of MonoTypeOperatorFunction', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(publishReplay(1, 1, (x) => x)));
});

it('should accept windowTime, bufferSize, selector returning union type, and a scheduler', () => {
  expectType<Observable<string | number>>(of(1, 2, 3).pipe(publishReplay(1, 1, () => Math.random() > 0.5 ? of(123) : of('test'), asyncScheduler)));
});

it('should accept windowTime, bufferSize, selector of OperatorFunction, and scheduler', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(publishReplay(1, 1, (x) => of('a'), asyncScheduler)));
});

it('should accept windowTime, bufferSize, selector of MonoTypeOperatorFunction, and scheduler', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(publishReplay(1, 1, (x) => x, asyncScheduler)));
});

it('should enforce type on selector', () => {
  expectError(of(1, 2, 3).pipe(publishReplay(1, 1, (x: Observable<string>) => x)));
});
