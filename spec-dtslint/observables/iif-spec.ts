import { a$, b$ } from 'helpers';
import { iif, EMPTY } from 'rxjs';

const randomBoolean = () => Math.random() > 0.5;

it('should error for insufficient parameters', () => {
  const r0 = iif(randomBoolean); // $ExpectError
  const r1 = iif(randomBoolean, a$); // $ExpectError
  const r2 = iif(randomBoolean, undefined, b$); // $ExpectError
});

it('should error for incorrect parameters', () => {
  const r0 = iif(() => 132, a$, b$); // $ExpectError
  const r1 = iif(randomBoolean, {}, b$); // $ExpectError
  const r2 = iif(randomBoolean, a$, {}); // $ExpectError
});

it('should infer correctly', () => {
  const r0 = iif(() => false, a$, b$); // $ExpectType Observable<A | B>
  const r1 = iif(() => true, a$, b$); // $ExpectType Observable<A | B>
  const r2 = iif(randomBoolean, a$, b$); // $ExpectType Observable<A | B>
  const r3 = iif(() => false, a$, EMPTY); // $ExpectType Observable<A>
  const r4 = iif(() => true, EMPTY, b$); // $ExpectType Observable<B>
  const r5 = iif(randomBoolean, EMPTY, EMPTY); // $ExpectType Observable<never>
});


it('should support inference from a predicate that returns any', () => {
  function alwaysTrueButReturnsAny(): any {
    return true;
  }

  const o$ = iif(alwaysTrueButReturnsAny, a$, b$) // $ExpectType Observable<A | B>
});