import { of, NEVER } from 'rxjs';
import { delayWhen } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(delayWhen(() => of('a', 'b', 'c'))); // $ExpectType Observable<number>
  const p = of(1, 2, 3).pipe(delayWhen((value: number, index: number) => of('a', 'b', 'c'))); // $ExpectType Observable<number>
});

it('should support an empty notifier', () => {
  const o = of(1, 2, 3).pipe(delayWhen(() => NEVER)); // $ExpectType Observable<number>
});

it('should support a subscriptiondelayWhen parameter', () => {
  const o = of(1, 2, 3).pipe(delayWhen(() => of('a', 'b', 'c'), of(new Date()))); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(delayWhen()); // $ExpectError
});

it('should enforce types of delayWhenDurationSelector', () => {
  const o = of(1, 2, 3).pipe(delayWhen(of('a', 'b', 'c'))); // $ExpectError
  const p = of(1, 2, 3).pipe(delayWhen((value: string, index) => of('a', 'b', 'c'))); // $ExpectError
  const q = of(1, 2, 3).pipe(delayWhen((value, index: string) => of('a', 'b', 'c'))); // $ExpectError
});

it('should enforce types of subscriptiondelayWhen', () => {
  const o = of(1, 2, 3).pipe(delayWhen(() => of('a', 'b', 'c'), 'a')); // $ExpectError
});
