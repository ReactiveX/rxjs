import { of, materialize } from 'rxjs';

it('should infer correctly', () => {
  const o = of('foo').pipe(materialize()); // $ExpectType Observable<ObservableNotification<string>>
});

it('should enforce types', () => {
  const o = of('foo').pipe(materialize(() => {})); // $ExpectError
});
