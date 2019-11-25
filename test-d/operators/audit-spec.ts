import { of, NEVER, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { audit } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(audit(() => of('foo'))));
  expectType<Observable<number>>(of(1, 2, 3).pipe(audit(() => NEVER)));
});

it('should infer correctly with a Promise', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(audit(() => new Promise<string>(() => {}))));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(audit()));
  expectError(of(1, 2, 3).pipe(audit((p: string) => of('foo'))));
});
