import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { refCount } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(refCount()));
});

it('should not accept any parameters', () => {
  expectError(of(1, 2, 3).pipe(refCount(1)));
});
