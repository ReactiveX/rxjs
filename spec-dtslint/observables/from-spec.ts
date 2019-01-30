import { from, of, animationFrameScheduler } from 'rxjs';

it('should accept an array', () => {
  const o = from([1, 2, 3, 4]); // $ExpectType Observable<number>
});

it('should accept a Promise', () => {
  const o = from(Promise.resolve('test')); // $ExpectType Observable<string>
});

it('should accept an Iterable', () => {
  const iterable = (function*() {
    yield 42;
  }());

  const o = from(iterable); // $ExpectType Observable<number>
});

it('should accept an Observable', () => {
  const o = from(of('test')); // $ExpectType Observable<string>
});

it('should accept union types', () => {
  const o = from(Math.random() > 0.5 ? of(123) : of('test')); // $ExpectType Observable<string | number>
});

it('should accept Observable<Observable<number>>', () => {
  const o = from(of(of(123))); // $ExpectType Observable<Observable<number>>
});

it('should accept Observable<number[]>', () => {
  const o = from(of([1, 2, 3])); // $ExpectType Observable<number[]>
});

it('should accept an array of Observables', () => {
  const o = from([of(1), of(2), of(3)]); // $ExpectType Observable<Observable<number>>
});

it('should accept an array of Inputs', () => {
  const iterable = (function*() {
    yield 42;
  }());

  const o = from([of(1), ['test'], iterable]); // $ExpectType Observable<IterableIterator<number> | Observable<number> | string[]>
});

it('should support scheduler', () => {
  const a = from([1, 2, 3], animationFrameScheduler); // $ExpectType Observable<number>
});
