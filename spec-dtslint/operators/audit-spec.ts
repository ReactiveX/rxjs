import { of, NEVER } from 'rxjs';
import { audit } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(audit(() => of('foo'))); // $ExpectType Observable<number>
  const p = of(1, 2, 3).pipe(audit(() => NEVER)); // $ExpectType Observable<number>
});

it('should infer correctly with a Promise', () => {
  const o = of(1, 2, 3).pipe(audit(() => new Promise<string>(() => {}))); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(audit()); // $ExpectError
  const p = of(1, 2, 3).pipe(audit((p: string) => of('foo'))); // $ExpectError
});
