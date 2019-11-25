import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { distinctUntilKeyChanged } from 'rxjs/operators';

const sample = {name: 'foobar', num: 42};

it('should infer correctly', () => {
  expectType<Observable<{ name: string; num: number; }>>(of(sample).pipe(distinctUntilKeyChanged('name')));
});

it('should infer correctly with compare', () => {
  expectType<Observable<{ name: string; num: number; }>>(of(sample).pipe(distinctUntilKeyChanged('name', () => true)));
});

it('should enforce key set', () => {
  expectError(of(sample).pipe(distinctUntilKeyChanged('something')));
});

it('should enforce key set with compare', () => {
  expectError(of(sample).pipe(distinctUntilKeyChanged('something', () => true)));
});

it("should enforce compare's type", () => {
  expectError(of(sample).pipe(distinctUntilKeyChanged('name', (a: number, b: number) => true)));
});

it("should enforce key set and compare's type", () => {
  expectError(of(sample).pipe(distinctUntilKeyChanged('something', (a: number, b: number) => true)));
});
