import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { retryWhen } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(retryWhen(errors => errors)));
});

it('should infer correctly when the error observable has a different type', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(retryWhen(retryWhen(errors => of('a', 'b', 'c')))));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(retryWhen()));
});

it('should enforce types of the notifier', () => {
  expectError(of(1, 2, 3).pipe(retryWhen(() => 8)));
});
