import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { mergeAll } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(of(1, 2, 3)).pipe(mergeAll()));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(mergeAll()));
});
