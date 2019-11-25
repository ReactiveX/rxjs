import { of, partition, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';

it('should infer correctly', () => {
  expectType<[Observable<string>, Observable<string>]>(partition(of('a', 'b', 'c'), (value, index) => true));
  expectType<[Observable<string>, Observable<string>]>(partition(of('a', 'b', 'c'), () => true));
});

it('should accept a thisArg parameter', () => {
  expectType<[Observable<string>, Observable<string>]>(partition(of('a', 'b', 'c'), () => true, 5));
});

it('should enforce predicate', () => {
  expectError(partition(of('a', 'b', 'c')));
});

it('should enforce predicate types', () => {
  expectError(partition(of('a', 'b', 'c'), 'nope'));
  expectError(partition(of('a', 'b', 'c'), (value: number) => true));
  expectError(partition(of('a', 'b', 'c'), (value, index: string) => true));
});
