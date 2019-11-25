import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { retry } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(retry()));
});

it('should accept a count parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(retry(47)));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(retry('aa')));
});
