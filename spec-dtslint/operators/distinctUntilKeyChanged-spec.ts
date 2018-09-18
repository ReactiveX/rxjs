import { of } from 'rxjs';
import { distinctUntilKeyChanged } from 'rxjs/operators';

const sample = {name: 'foobar', num: 42};

it('should infer correctly', () => {
  const o = of(sample).pipe(distinctUntilKeyChanged('name')); // $ExpectType Observable<{ name: string; num: number; }>
});

it('should infer correctly with compare', () => {
  const o = of(sample).pipe(distinctUntilKeyChanged('name', () => true)); // $ExpectType Observable<{ name: string; num: number; }>
});

it('should enforce key set', () => {
  const o = of(sample).pipe(distinctUntilKeyChanged('something')); // $ExpectError
});

it('should enforce key set with compare', () => {
  const o = of(sample).pipe(distinctUntilKeyChanged('something', () => true)); // $ExpectError
});

it("should enforce compare's type", () => {
  const o = of(sample).pipe(distinctUntilKeyChanged('name', (a: number, b: number) => true)); // $ExpectError
});

it("should enforce key set and compare's type", () => {
  const o = of(sample).pipe(distinctUntilKeyChanged('something', (a: number, b: number) => true)); // $ExpectError
});
