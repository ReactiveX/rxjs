import { of, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { auditTime } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(auditTime(47)));
});

it('should support a scheduler', () => {
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(auditTime(47, asyncScheduler)));
});

it('should enforce types', () => {
  expectError(of('a', 'b', 'c').pipe(auditTime()));
  expectError(of('a', 'b', 'c').pipe(auditTime('47')));
  expectError(of('a', 'b', 'c').pipe(auditTime(47, 'foo')));
});
