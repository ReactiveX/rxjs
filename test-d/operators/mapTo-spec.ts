import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { mapTo } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(mapTo(47)));
});

it('should infer correctly when returning a different type', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(mapTo('carrot')));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(mapTo()));
});
