import { of, NEVER, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { delayWhen } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(delayWhen(() => of('a', 'b', 'c'))));
  expectType<Observable<number>>(of(1, 2, 3).pipe(delayWhen((value: number, index: number) => of('a', 'b', 'c'))));
});

it('should support an empty notifier', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(delayWhen(() => NEVER)));
});

it('should support a subscriptiondelayWhen parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(delayWhen(() => of('a', 'b', 'c'), of(new Date()))));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(delayWhen()));
});

it('should enforce types of delayWhenDurationSelector', () => {
  expectError(of(1, 2, 3).pipe(delayWhen(of('a', 'b', 'c'))));
  expectError(of(1, 2, 3).pipe(delayWhen((value: string, index) => of('a', 'b', 'c'))));
  expectError(of(1, 2, 3).pipe(delayWhen((value, index: string) => of('a', 'b', 'c'))));
});

it('should enforce types of subscriptiondelayWhen', () => {
  expectError(of(1, 2, 3).pipe(delayWhen(() => of('a', 'b', 'c'), 'a')));
});
