import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { concatAll } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(of(1, 2, 3)).pipe(concatAll()));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(concatAll()));
});
