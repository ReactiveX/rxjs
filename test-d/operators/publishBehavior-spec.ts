import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { publishBehavior } from 'rxjs/operators';

it('should enforce parameter', () => {
  expectError(of(1, 2, 3).pipe(publishBehavior()));
});

it('should infer correctly with parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(publishBehavior(4)));
});

it('should enforce type on parameter', () => {
  expectError(of(1, 2, 3).pipe(publishBehavior('a'));
});
