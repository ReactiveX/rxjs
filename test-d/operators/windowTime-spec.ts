import { of, asyncScheduler, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { windowTime } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<Observable<string>>>(of('a', 'b', 'c').pipe(windowTime(10)));
  expectType<Observable<Observable<string>>>(of('a', 'b', 'c').pipe(windowTime(10, asyncScheduler)));
});

it('should support a windowCreationInterval', () => {
  expectType<Observable<Observable<string>>>(of('a', 'b', 'c').pipe(windowTime(10, 30)));
  expectType<Observable<Observable<string>>>(of('a', 'b', 'c').pipe(windowTime(10, 30, asyncScheduler)));
});

it('should support a maxWindowSize', () => {
  expectType<Observable<Observable<string>>>(of('a', 'b', 'c').pipe(windowTime(10, 30, 80)));
  expectType<Observable<Observable<string>>>(of('a', 'b', 'c').pipe(windowTime(10, 30, 80, asyncScheduler)));
});

it('should enforce types', () => {
  expectError(of('a', 'b', 'c').pipe(windowTime()));
});

it('should enforce windowTimeSpan type', () => {
  expectError(of('a', 'b', 'c').pipe(windowTime('nope')));
});

it('should enforce windowCreationInterval type', () => {
  expectError(of('a', 'b', 'c').pipe(windowTime(10, 'nope')));
});

it('should enforce maxWindowSize type', () => {
  expectError(of('a', 'b', 'c').pipe(windowTime(10, 30, 'nope')));
});

it('should enforce scheduler type', () => {
  expectError(of('a', 'b', 'c').pipe(windowTime(10, 30, 50, 'nope')));
});
