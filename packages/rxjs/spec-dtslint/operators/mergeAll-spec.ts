import { of } from 'rxjs';
import { mergeAll } from 'rxjs/operators';
import { a$, b$ } from '../helpers';

it('should infer correctly with sources of same type', () => {
  const o = of(a$, a$).pipe(mergeAll()); // $ExpectType Observable<A>
});

it('should infer correctly with sources of different types', () => {
  const o = of(a$, b$).pipe(mergeAll()); // $ExpectType Observable<A | B>
});

it('should enforce types', () => {
  const o = a$.pipe(mergeAll()); // $ExpectError
});
