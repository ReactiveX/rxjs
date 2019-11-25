import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { sample } from 'rxjs/operators';

it('should enforce parameter', () => {
  expectError(of(1, 2, 3).pipe(sample()));
});

it('should accept observable as notifier parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(sample(of(4))));
  expectType<Observable<number>>(of(1, 2, 3).pipe(sample(of('a'))));
});
