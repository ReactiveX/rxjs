import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { publishLast } from 'rxjs/operators';

it('should accept empty parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(publishLast()));
});

it('should infer when type is specified', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe<number>(publishLast()));
});
