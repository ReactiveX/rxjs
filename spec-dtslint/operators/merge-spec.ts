import { of, asyncScheduler } from 'rxjs';
import { merge } from 'rxjs/operators';
import { A, B, C, D, E, F, G, a, b, c, d, e, f, g } from '../helpers';

it('should accept no parameter', () => {
  const res = a.pipe(merge()); // $ExpectType Observable<A>
});

it('should infer correctly with scheduler param', () => {
  const res = a.pipe(merge(asyncScheduler)); // $ExpectType Observable<A>
});

it('should infer correctly with concurrent param', () => {
  const res = a.pipe(merge(3)); // $ExpectType Observable<A>
});

it('should infer correctly with concurrent and scheduler param', () => {
  const res = a.pipe(merge(3, asyncScheduler)); // $ExpectType Observable<A>
});

it('should infer correctly with 1 Observable param', () => {
  const res = a.pipe(merge(b)); // $ExpectType Observable<A | B>
});

it('should infer correctly with 2 Observable param', () => {
  const res = a.pipe(merge(b, c)); // $ExpectType Observable<A | B | C>
});

it('should infer correctly with 3 Observable param', () => {
  const res = a.pipe(merge(b, c, d)); // $ExpectType Observable<A | B | C | D>
});

it('should infer correctly with 4 Observable param', () => {
  const res = a.pipe(merge(b, c, d, e)); // $ExpectType Observable<A | B | C | D | E>
});

it('should infer correctly with 5 Observable param', () => {
  const res = a.pipe(merge(b, c, d, e, f)); // $ExpectType Observable<A | B | C | D | E | F>
});

it('should infer correctly with 1 Observable and concurrent param', () => {
  const res = a.pipe(merge(b, 1)); // $ExpectType Observable<A | B>
});

it('should infer correctly with 2 Observable and concurrent param', () => {
  const res = a.pipe(merge(b, c, 1)); // $ExpectType Observable<A | B | C>
});

it('should infer correctly with 3 Observable and concurrent param', () => {
  const res = a.pipe(merge(b, c, d, 1)); // $ExpectType Observable<A | B | C | D>
});

it('should infer correctly with 4 Observable and concurrent param', () => {
  const res = a.pipe(merge(b, c, d, e, 1)); // $ExpectType Observable<A | B | C | D | E>
});

it('should infer correctly with 5 Observable and concurrent param', () => {
  const res = a.pipe(merge(b, c, d, e, f, 1)); // $ExpectType Observable<A | B | C | D | E | F>
});

it('should infer correctly with 1 Observable, concurrent, and scheduler param', () => {
  const res = a.pipe(merge(b, 1, asyncScheduler)); // $ExpectType Observable<A | B>
});

it('should infer correctly with 2 Observable, concurrent, and scheduler param', () => {
  const res = a.pipe(merge(b, c, 1, asyncScheduler)); // $ExpectType Observable<A | B | C>
});

it('should infer correctly with 3 Observable, concurrent, and scheduler param', () => {
  const res = a.pipe(merge(b, c, d, 1, asyncScheduler)); // $ExpectType Observable<A | B | C | D>
});

it('should infer correctly with 4 Observable, concurrent, and scheduler param', () => {
  const res = a.pipe(merge(b, c, d, e, 1, asyncScheduler)); // $ExpectType Observable<A | B | C | D | E>
});

it('should infer correctly with 5 Observable, concurrent, and scheduler param', () => {
  const res = a.pipe(merge(b, c, d, e, f, 1, asyncScheduler)); // $ExpectType Observable<A | B | C | D | E | F>
});

// TODO: Fix this when the both merge operator and merge creator function has been fix
// see: https://github.com/ReactiveX/rxjs/pull/4371#issuecomment-441124096
// Comment is about combineLater, but, it's the same problem to fix
// it('should infer correctly with array param', () => {
//   const res = of(1, 2, 3);
//   const b = [of('a', 'b', 'c')];
//   const res = a.pipe(merge(b)); // $ExpectType Observable<number|Observable<string>>
// });
