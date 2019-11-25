import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { finalize } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(finalize(() => {})));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(finalize()));
  expectError(of(1, 2, 3).pipe(finalize((value => {}))));
});
