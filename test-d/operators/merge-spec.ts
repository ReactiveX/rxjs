import { asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { merge } from 'rxjs/operators';
import { a$, b$, c$, d$, e$, f$} from '../helpers';

it('should accept no parameter', () => {
  expectType<Observable<A>>(a$.pipe(merge()));
});

it('should infer correctly with scheduler param', () => {
  expectType<Observable<A>>(a$.pipe(merge(asyncScheduler)));
});

it('should infer correctly with concurrent param', () => {
  expectType<Observable<A>>(a$.pipe(merge(3)));
});

it('should infer correctly with concurrent and scheduler param', () => {
  expectType<Observable<A>>(a$.pipe(merge(3, asyncScheduler)));
});

it('should infer correctly with 1 Observable param', () => {
  expectType<Observable<A | B>>(a$.pipe(merge(b$)));
});

it('should infer correctly with 2 Observable param', () => {
  expectType<Observable<A | B | C>>(a$.pipe(merge(b$, c$)));
});

it('should infer correctly with 3 Observable param', () => {
  expectType<Observable<A | B | C | D>>(a$.pipe(merge(b$, c$, d$)));
});

it('should infer correctly with 4 Observable param', () => {
  expectType<Observable<A | B | C | D | E>>(a$.pipe(merge(b$, c$, d$, e$)));
});

it('should infer correctly with 5 Observable param', () => {
  expectType<Observable<A | B | C | D | E | F>>(a$.pipe(merge(b$, c$, d$, e$, f$)));
});

it('should infer correctly with 1 Observable and concurrent param', () => {
  expectType<Observable<A | B>>(a$.pipe(merge(b$, 1)));
});

it('should infer correctly with 2 Observable and concurrent param', () => {
  expectType<Observable<A | B | C>>(a$.pipe(merge(b$, c$, 1)));
});

it('should infer correctly with 3 Observable and concurrent param', () => {
  expectType<Observable<A | B | C | D>>(a$.pipe(merge(b$, c$, d$, 1)));
});

it('should infer correctly with 4 Observable and concurrent param', () => {
  expectType<Observable<A | B | C | D | E>>(a$.pipe(merge(b$, c$, d$, e$, 1)));
});

it('should infer correctly with 5 Observable and concurrent param', () => {
  expectType<Observable<A | B | C | D | E | F>>(a$.pipe(merge(b$, c$, d$, e$, f$, 1)));
});

it('should infer correctly with 1 Observable, concurrent, and scheduler param', () => {
  expectType<Observable<A | B>>(a$.pipe(merge(b$, 1, asyncScheduler)));
});

it('should infer correctly with 2 Observable, concurrent, and scheduler param', () => {
  expectType<Observable<A | B | C>>(a$.pipe(merge(b$, c$, 1, asyncScheduler)));
});

it('should infer correctly with 3 Observable, concurrent, and scheduler param', () => {
  expectType<Observable<A | B | C | D>>(a$.pipe(merge(b$, c$, d$, 1, asyncScheduler)));
});

it('should infer correctly with 4 Observable, concurrent, and scheduler param', () => {
  expectType<Observable<A | B | C | D | E>>(a$.pipe(merge(b$, c$, d$, e$, 1, asyncScheduler)));
});

it('should infer correctly with 5 Observable, concurrent, and scheduler param', () => {
  expectType<Observable<A | B | C | D | E | F>>(a$.pipe(merge(b$, c$, d$, e$, f$, 1, asyncScheduler)));
});

// TODO: Fix this when the both merge operator and merge creator function has been fix
// see: https://github.com/ReactiveX/rxjs/pull/4371#issuecomment-441124096
// Comment is about combineLater, but, it's the same problem to fix
// it('should infer correctly with array param', () => {
//   const res = of(1, 2, 3);
//   const b = [of('a', 'b', 'c')];
expectType<Observable<number|Observable<string>>>(a.pipe(merge(b)));
// });
