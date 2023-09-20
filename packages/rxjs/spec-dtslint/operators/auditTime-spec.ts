import { of, asyncScheduler } from 'rxjs';
import { auditTime } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of('a', 'b', 'c').pipe(auditTime(47)); // $ExpectType Observable<string>
});

it('should support a scheduler', () => {
  const o = of('a', 'b', 'c').pipe(auditTime(47, asyncScheduler)); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of('a', 'b', 'c').pipe(auditTime()); // $ExpectError
  const p = of('a', 'b', 'c').pipe(auditTime('47')); // $ExpectError
  const q = of('a', 'b', 'c').pipe(auditTime(47, 'foo')); // $ExpectError
});
