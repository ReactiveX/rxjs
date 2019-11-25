import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { map } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(map(value => value)));
});

it('should infer correctly when returning a different type', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(map(String)));
});

it('should support an index parameter', () => {
  expectType<Observable<number>>(of('a', 'b', 'c').pipe(map((value, index) => index)));
});

it('should support an extra parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(map(value => value, 'something')));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(map()));
});

it('should enforce the projecter types', () => {
  expectError(of(1, 2, 3).pipe(map((value: string) => value)));
  expectError(of(1, 2, 3).pipe(map((value, index: string) => value)));
});
