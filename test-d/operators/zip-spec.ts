import { Observable, of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { zip } from 'rxjs/operators';

it('should support rest parameter observables', () => {
  expectType<Observable<number>>(of(1));
  expectType<Observable<number>[]>([of(2)]);
  expectType<Observable<unknown>>(o.pipe(zip(...z)));
});

it('should support rest parameter observables with type parameters', () => {
  expectType<Observable<number>>(of(1));
  expectType<Observable<number>[]>([of(2)]);
  expectType<Observable<number[]>>(o.pipe(zip<number, number[]>(...z)));
});

it('should support projected rest parameter observables', () => {
  expectType<Observable<number>>(of(1));
  expectType<Observable<number>[]>([of(2)]);
  expectType<Observable<string[]>>(o.pipe(zip(...z, (...r) => r.map(v => v.toString()))));
});

it('should support projected rest parameter observables with type parameters', () => {
  expectType<Observable<number>>(of(1));
  expectType<Observable<number>[]>([of(2)]);
  expectType<Observable<string[]>>(o.pipe(zip<number, string[]>(...z, (...r) => r.map(v => v.toString()))));
});

it('should support projected arrays of observables', () => {
  expectType<Observable<number>>(of(1));
  expectType<Observable<number>[]>([of(2)]);
  expectType<Observable<any[]>>(o.pipe(zip(z, (...r: any[]) => r.map(v => v.toString()))));
});

it('should support projected arrays of observables with type parameters', () => {
  expectType<Observable<number>>(of(1));
  expectType<Observable<number>[]>([of(2)]);
  expectType<Observable<string[]>>(o.pipe(zip<number, number, string[]>(z, (...r: any[]) => r.map(v => v.toString()))));
});
