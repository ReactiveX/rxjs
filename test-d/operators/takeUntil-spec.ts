import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { takeUntil } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(takeUntil(of(1, 2, 3))));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(takeUntil(value => value < 3)));
});
