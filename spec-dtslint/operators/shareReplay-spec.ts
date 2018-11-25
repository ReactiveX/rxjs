import { of, asyncScheduler } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of('foo', 'bar', 'baz').pipe(shareReplay()); // $ExpectType Observable<string>
});

it('should support a bufferSize', () => {
  const o = of('foo', 'bar', 'baz').pipe(shareReplay(6)); // $ExpectType Observable<string>
});

it('should support a windowTime', () => {
  const o = of('foo', 'bar', 'baz').pipe(shareReplay(6, 4)); // $ExpectType Observable<string>
});

it('should support a scheduler', () => {
  const o = of('foo', 'bar', 'baz').pipe(shareReplay(6, 4, asyncScheduler)); // $ExpectType Observable<string>
});

it('should enforce type of bufferSize', () => {
  const o = of('foo', 'bar', 'baz').pipe(shareReplay('abc')); // $ExpectError
});

it('should enforce type of windowTime', () => {
  const o = of('foo', 'bar', 'baz').pipe(shareReplay(5, 'abc')); // $ExpectError
});

it('should enforce type of scheduler', () => {
  const o = of('foo', 'bar', 'baz').pipe(shareReplay(5, 3, 'abc')); // $ExpectError
});
