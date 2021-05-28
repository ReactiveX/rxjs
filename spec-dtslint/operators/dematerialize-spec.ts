import { of, Notification } from 'rxjs';
import { dematerialize } from 'rxjs/operators';


it('should infer correctly', () => {
  const o = of(Notification.createNext('foo')).pipe(dematerialize()); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of(Notification.createNext('foo')).pipe(dematerialize(() => {})); // $ExpectError
});

it('should enforce types from POJOS', () => {
  const source = of({
    kind: 'N' as const,
    value: 'test'
  }, {
    kind: 'N' as const,
    value: 123
  },
  {
    kind: 'N' as const,
    value: [true, false]
  });
  const o = source.pipe(dematerialize()); // $ExpectType Observable<string | number | boolean[]>

  // NOTE: The `const` is required, because TS doesn't yet have a way to know for certain the
  // `kind` properties of these objects won't be mutated at runtime.
  const source2 = of({
    kind: 'N' as const,
    value: 1
  }, {
    kind: 'C' as const
  });
  const o2 = source2.pipe(dematerialize()); // $ExpectType Observable<number>

  const source3 = of({
    kind: 'C' as const
  });
  const o3 = source3.pipe(dematerialize()); // $ExpectType Observable<never>

  const source4 = of({
    kind: 'E' as const,
    error: new Error('bad')
  });
  const o4 = source4.pipe(dematerialize()); // $ExpectType Observable<never>

  const source5 = of({
    kind: 'E' as const
  });
  const o5 = source5.pipe(dematerialize()); // $ExpectError


  // Next notifications should have a value.
  const source6 = of({
    kind: 'N' as const
  });
  const o6 = source6.pipe(dematerialize()); // $ExpectError
});

it('should enforce Notification source', () => {
  const o = of('foo').pipe(dematerialize()); // $ExpectError
});
