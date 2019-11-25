import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { pairwise } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<[string, string]>>(of('apple', 'banana', 'peach').pipe(pairwise()));
});

it('should infer correctly with multiple types', () => {
  expectType<Observable<[string | number, string | number]>>(of('apple', 4, 'peach', 7).pipe(pairwise()));
});

it('should enforce types', () => {
  expectError(of('apple', 'banana', 'peach').pipe(pairwise('lemon')));
});
