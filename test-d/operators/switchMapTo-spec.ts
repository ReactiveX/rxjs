import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { switchMapTo } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(switchMapTo(of('foo'))));
});

it('should infer correctly with multiple types', () => {
  expectType<Observable<string | number>>(of(1, 2, 3).pipe(switchMapTo(of('foo', 4))));
});

it('should infer correctly with an array', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(switchMapTo([4, 5, 6])));
});

it('should infer correctly with a Promise', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(switchMapTo(new Promise<string>(() => {}))));
});

it('should infer correctly by using the resultSelector first parameter', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(switchMapTo(of('foo'), a => a)));
});

it('should infer correctly by using the resultSelector second parameter', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(switchMapTo(of('foo'), (a, b) => b)));
});

it('should support a resultSelector that takes an inner index', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(switchMapTo(of('foo'), (a, b, innnerIndex) => a)));
});

it('should support a resultSelector that takes an inner and outer index', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(switchMapTo(of('foo'), (a, b, innnerIndex, outerIndex) => a)));
});

it('should support an undefined resultSelector', () => {
  expectType<Observable<string>>(of(1, 2, 3).pipe(switchMapTo(of('foo'), undefined)));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(switchMapTo()));
});

it('should enforce the return type', () => {
  expectError(of(1, 2, 3).pipe(switchMapTo(p => p)));
  expectError(of(1, 2, 3).pipe(switchMapTo(4)));
});
