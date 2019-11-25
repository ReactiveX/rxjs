import { of, Observable, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { publish } from 'rxjs/operators';

it('should support empty parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(publish()));
});

it('should infer when type is specified', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe<number>(publish()));
});

it('should infer correctly with parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(publish(x => x)));
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(publish(x => x)));
});

it('should enforce type on selector', () => {
  expectError(of(1, 2, 3).pipe(publish((x: Observable<string>) => x)));
});

it('should support union types in selector', () => {
  expectType<Observable<string | number>>(of(1, 2, 3).pipe(publish(() => Math.random() > 0.5 ? of(123) : of('test'))));
});
