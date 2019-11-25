import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { onErrorResumeNext } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of('apple', 'banana', 'peach').pipe(onErrorResumeNext()));
});

it('should accept one input', () => {
  expectType<Observable<string | number>>(of('apple', 'banana', 'peach').pipe(onErrorResumeNext(of(1))));
  expectType<Observable<string>>(of('apple', 'banana', 'peach').pipe(onErrorResumeNext(of('5'))));
});

it('should accept promises', () => {
  expectType<Observable<string | number>>(of('apple', 'banana', 'peach').pipe(onErrorResumeNext(Promise.resolve(5))));
});

it('should accept iterables', () => {
  expectType<Observable<string>>(of('apple', 'banana', 'peach').pipe(onErrorResumeNext('foo')));
});

it('should accept arrays', () => {
  expectType<Observable<string | number>>(of('apple', 'banana', 'peach').pipe(onErrorResumeNext([5])));
});

it('should accept two inputs', () => {
  expectType<Observable<string | number>>(of('apple', 'banana', 'peach').pipe(onErrorResumeNext(of(1), of(2))));
});

it('should accept three inputs', () => {
  expectType<Observable<string | number>>(of('apple', 'banana', 'peach').pipe(onErrorResumeNext(of(1), of(2), of('3'))));
});

it('should accept four inputs', () => {
  expectType<Observable<string | number>>(of('apple', 'banana', 'peach').pipe(onErrorResumeNext(of(1), of(2), of('3'), of('4'))));
});

it('should accept five inputs', () => {
  expectType<Observable<string | number>>(of('apple', 'banana', 'peach').pipe(onErrorResumeNext(of(1), of(2), of('3'), of('4'), of(5))));
});

it('should accept six inputs', () => {
  expectType<Observable<string | number>>(of('apple', 'banana', 'peach').pipe(onErrorResumeNext(of(1), of(2), of('3'), of('4'), of(5), of('6'))));
});

it('should accept seven and more inputs', () => {
  expectType<Observable<unknown>>(of('apple', 'banana', 'peach').pipe(onErrorResumeNext(of(1), of(2), of('3'), of('4'), of(5), of('6'), of(7))));
  expectType<Observable<string | number>>(of('apple', 'banana', 'peach').pipe(onErrorResumeNext<string, string | number>(of(1), of(2), of('3'), of('4'), of(5), of('6'), of(7))));
});

it('should enforce types', () => {
  expectError(of('apple', 'banana', 'peach').pipe(onErrorResumeNext(5)));
});

it('should enforce source types', () => {
  expectError(of('apple', 'banana', 'peach').pipe(onErrorResumeNext<number, number>(of(5))));
});
