import { of, asyncScheduler } from 'rxjs';
import { merge } from 'rxjs/operators';

it('should accept no parameter', () => {
  const a = of(1, 2, 3).pipe(merge()); // $ExpectType Observable<number>
});

it('should infer correctly with scheduler param', () => {
  const a = of(1, 2, 3).pipe(merge(asyncScheduler)); // $ExpectType Observable<number>
});

it('should infer correctly with concurrent param', () => {
  const a = of(1, 2, 3).pipe(merge(3)); // $ExpectType Observable<number>
});

it('should infer correctly with concurrent and scheduler param', () => {
  const a = of(1, 2, 3).pipe(merge(3, asyncScheduler)); // $ExpectType Observable<number>
});

it('should infer correctly with 1 Observable param', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const res = a.pipe(merge(b)); // $ExpectType Observable<string | number>
});

it('should infer correctly with 2 Observable param', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of(true, true, false);
  const res = a.pipe(merge(b, c)); // $ExpectType Observable<string | number | boolean>
});

it('should infer correctly with 3 Observable param', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of('d', 'e', 'f');
  const d = of('g', 'h', 'i');
  const res = a.pipe(merge(b, c, d)); // $ExpectType Observable<string | number>
});

it('should infer correctly with 4 Observable param', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of('d', 'e', 'f');
  const d = of('g', 'h', 'i');
  const e = of('j', 'k', 'l');
  const res = a.pipe(merge(b, c, d, e)); // $ExpectType Observable<string | number>
});

it('should infer correctly with 5 Observable param', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of('d', 'e', 'f');
  const d = of('g', 'h', 'i');
  const e = of('j', 'k', 'l');
  const f = of('m', 'n', 'o');
  const res = a.pipe(merge(b, c, d, e, f)); // $ExpectType Observable<string | number>
});

it('should infer correctly with 1 Observable and concurrent param', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const res = a.pipe(merge(b, 1)); // $ExpectType Observable<string | number>
});

it('should infer correctly with 2 Observable and concurrent param', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of(true, true, false);
  const res = a.pipe(merge(b, c, 1)); // $ExpectType Observable<string | number | boolean>
});

it('should infer correctly with 3 Observable and concurrent param', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of('d', 'e', 'f');
  const d = of('g', 'h', 'i');
  const res = a.pipe(merge(b, c, d, 1)); // $ExpectType Observable<string | number>
});

it('should infer correctly with 4 Observable and concurrent param', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of('d', 'e', 'f');
  const d = of('g', 'h', 'i');
  const e = of('j', 'k', 'l');
  const res = a.pipe(merge(b, c, d, e, 1)); // $ExpectType Observable<string | number>
});

it('should infer correctly with 5 Observable and concurrent param', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of('d', 'e', 'f');
  const d = of('g', 'h', 'i');
  const e = of('j', 'k', 'l');
  const f = of('m', 'n', 'o');
  const res = a.pipe(merge(b, c, d, e, f, 1)); // $ExpectType Observable<string | number>
});

it('should infer correctly with 1 Observable, concurrent, and scheduler param', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const res = a.pipe(merge(b, 1, asyncScheduler)); // $ExpectType Observable<string | number>
});

it('should infer correctly with 2 Observable, concurrent, and scheduler param', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of(true, true, false);
  const res = a.pipe(merge(b, c, 1, asyncScheduler)); // $ExpectType Observable<string | number | boolean>
});

it('should infer correctly with 3 Observable, concurrent, and scheduler param', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of('d', 'e', 'f');
  const d = of('g', 'h', 'i');
  const res = a.pipe(merge(b, c, d, 1, asyncScheduler)); // $ExpectType Observable<string | number>
});

it('should infer correctly with 4 Observable, concurrent, and scheduler param', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of('d', 'e', 'f');
  const d = of('g', 'h', 'i');
  const e = of('j', 'k', 'l');
  const res = a.pipe(merge(b, c, d, e, 1, asyncScheduler)); // $ExpectType Observable<string | number>
});

it('should infer correctly with 5 Observable, concurrent, and scheduler param', () => {
  const a = of(1, 2, 3);
  const b = of('a', 'b', 'c');
  const c = of('d', 'e', 'f');
  const d = of('g', 'h', 'i');
  const e = of('j', 'k', 'l');
  const f = of('m', 'n', 'o');
  const res = a.pipe(merge(b, c, d, e, f, 1, asyncScheduler)); // $ExpectType Observable<string | number>
});

// TODO: Fix this when the both merge operator and merge creator function has been fix
// see: https://github.com/ReactiveX/rxjs/pull/4371#issuecomment-441124096
// Comment is about combineLater, but, it's the same problem to fix
// it('should infer correctly with array param', () => {
//   const a = of(1, 2, 3);
//   const b = [of('a', 'b', 'c')];
//   const res = a.pipe(merge(b)); // $ExpectType Observable<number|Observable<string>>
// });
