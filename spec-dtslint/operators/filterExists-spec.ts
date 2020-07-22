import { of } from 'rxjs';
import { filterExists } from 'rxjs/operators';

it('should works for NaN', () => {
  const o = of(NaN).pipe(filterExists()); // $ExpectType Observable<number>
});

it('should works for null', () => {
  const o = of(null).pipe(filterExists()); // $ExpectType Observable<null>
});

it('should works for undefined', () => {
  const o = of(undefined).pipe(filterExists()); // $ExpectType Observable<undefined>
});

it('should works for empty string', () => {
  const o = of('').pipe(filterExists()); // $ExpectType Observable<string>
});

it('should works for not empty string', () => {
  const o = of('testing').pipe(filterExists()); // $ExpectType Observable<string>
});

it('should works for empty Array', () => {
  const o = of([]).pipe(filterExists()); // $ExpectType Observable<never[]>
});

it('should works for Array of numbers', () => {
  const o = of([1,2,3]).pipe(filterExists()); // $ExpectType Observable<number[]>
});

it('should works for Array of strings', () => {
  const o = of(['1','2','3']).pipe(filterExists()); // $ExpectType Observable<string[]>
});

it('should works for Array of objects', () => {
  interface TestingObject {
    a: number;
  }
  const o = of([{a: 1},{a: 1},{a: 1}]).pipe(filterExists<TestingObject[]>()); // $ExpectType Observable<TestingObject[]>
});

it('should works for empty object', () => {
  const o = of({}).pipe(filterExists()); // $ExpectType Observable<{}>
});

it('should works for a defined object', () => {
  interface TestingObject {
    a: number;
  }
  const o = of({a: 1}).pipe(filterExists<TestingObject>()); // $ExpectType Observable<TestingObject>
});




