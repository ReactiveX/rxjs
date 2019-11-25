import { never, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';

it('should not support any parameter', () => {
  expectError(never(1));
});

it('should infer never', () => {
  expectType<Observable<never>>(never());
});
