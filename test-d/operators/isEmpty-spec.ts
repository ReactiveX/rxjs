import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { isEmpty } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<boolean>>(of(1, 2, 3).pipe(isEmpty()));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(isEmpty('nope')));
});
