import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { takeLast } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(takeLast(7)));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(takeLast('7')));
});
