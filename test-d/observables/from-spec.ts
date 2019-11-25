import { from, of, animationFrameScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';

it('should accept an array', () => {
  expectType<Observable<number>>(from([1, 2, 3, 4]));
});

it('should accept a Promise', () => {
  expectType<Observable<string>>(from(Promise.resolve('test')));
});

it('should accept an Iterable', () => {
  const iterable = (function*() {
    yield 42;
  }());

  expectType<Observable<number>>(from(iterable));
});

it('should accept an Observable', () => {
  expectType<Observable<string>>(from(of('test')));
});

it('should accept union types', () => {
  expectType<Observable<string | number>>(from(Math.random() > 0.5 ? of(123) : of('test')));
});

it('should accept Observable<Observable<number>>', () => {
  expectType<Observable<Observable<number>>>(from(of(of(123))));
});

it('should accept Observable<number[]>', () => {
  expectType<Observable<number[]>>(from(of([1, 2, 3])));
});

it('should accept an array of Observables', () => {
  expectType<Observable<Observable<number>>>(from([of(1), of(2), of(3)]));
});

// TODO(benlesh): enable this test, once the issue is resolved upstream (https://github.com/Microsoft/dtslint/issues/191)

// NOTE: It appears to be working, it's just that dtslint sometimes says it wants
// Observable<IterableIterator<number> | Observable<number> | string[]>
// and if you switch it to that, it wants
// Observable<Observable<number> | IterableIterator<number> | string[]>
// and vica versa.

// it('should accept an array of Inputs', () => {
//   const iterable = (function*() {
//     yield 42;
//   }());

//   const o = from([of(1), ['test'], iterable]); // $__TODO__ExpectType Observable<IterableIterator<number> | Observable<number> | string[]>
// });

it('should support scheduler', () => {
  expectType<Observable<number>>(from([1, 2, 3], animationFrameScheduler));
});
