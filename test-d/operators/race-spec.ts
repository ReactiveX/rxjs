import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { race } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(race()));
});

it('should allow observables', () => {
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(race(of('x', 'y', 'z'))));
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(race(of('x', 'y', 'z'), of('t', 'i', 'm'))));
});

it('should allow an array of observables', () => {
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(race([of('x', 'y', 'z')])));
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(race([of('x', 'y', 'z'), of('t', 'i', 'm')])));
});

it('should be possible to provide a return type', () => {
  expectType<Observable<number>>(of('a', 'b', 'c').pipe(race<string, number>([of(1, 2, 3)])));
  expectType<Observable<number>>(of('a', 'b', 'c').pipe(race<string, number>([of(1, 2, 3), of('t', 'i', 'm')])));
  expectType<Observable<number>>(of('a', 'b', 'c').pipe(race<string, number>(of(1, 2, 3), [of(1, 2, 3)])));
  expectType<Observable<number>>(of('a', 'b', 'c').pipe(race<string, number>([of(1, 2, 3)], of('t', 'i', 'm'))));
});

it('should be possible to use nested arrays', () => {
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(race([of('x', 'y', 'z')])));
});

it('should enforce types', () => {
  expectError(of('a', 'b', 'c').pipe(race('aa')));
});

it('should enforce argument types when not provided ', () => {
  expectError(of('a', 'b', 'c').pipe(race(of(1, 2, 3))));
  expectError(of('a', 'b', 'c').pipe(race([of(1, 2, 3)])));
});
