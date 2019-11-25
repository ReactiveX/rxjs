import { of, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { subscribeOn } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(subscribeOn(asyncScheduler)));
});

it('should support a delay ', () => {
  expectType<Observable<string>>(of('a', 'b', 'c').pipe(subscribeOn(asyncScheduler, 7)));
});

it('should enforce types', () => {
  expectError(of('a', 'b', 'c').pipe(subscribeOn()));
});

it('should enforce scheduler type', () => {
  expectError(of('a', 'b', 'c').pipe(subscribeOn('nope')));
});

it('should enforce delay type', () => {
  expectError(of('a', 'b', 'c').pipe(subscribeOn(asyncScheduler, 'nope')));
});
