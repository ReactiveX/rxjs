import { of, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { observeOn } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of('apple', 'banana', 'peach').pipe(observeOn(asyncScheduler)));
});

it('should support a delay', () => {
  expectType<Observable<string>>(of('apple', 'banana', 'peach').pipe(observeOn(asyncScheduler, 47)));
});

it('should enforce types', () => {
  expectError(of('apple', 'banana', 'peach').pipe(observeOn()));
});

it('should enforce scheduler type', () => {
  expectError(of('apple', 'banana', 'peach').pipe(observeOn('fruit')));
});

it('should enforce delay type', () => {
  expectError(of('apple', 'banana', 'peach').pipe(observeOn(asyncScheduler, '47')));
});
