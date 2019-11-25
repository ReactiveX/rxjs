import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { materialize } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<Notification<string>>>(of('foo').pipe(materialize()));
});

it('should enforce types', () => {
  expectError(of('foo').pipe(materialize(() => {})));
});
