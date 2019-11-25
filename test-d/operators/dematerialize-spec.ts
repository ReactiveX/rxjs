import { of, Notification, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { dematerialize } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of(Notification.createNext('foo')).pipe(dematerialize()));
});

it('should enforce types', () => {
  expectError(of(Notification.createNext('foo')).pipe(dematerialize(() => {})));
});

it('should enforce Notification source', () => {
  expectError(of('foo').pipe(dematerialize()));
});
