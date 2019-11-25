import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { repeat } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(repeat()));
});

it('should accept a count parameter', () => {
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(repeat(47)));
});

it('should enforce types', () => {
  expectError(of('a', 'b', 'c').pipe(repeat('aa')));
});
