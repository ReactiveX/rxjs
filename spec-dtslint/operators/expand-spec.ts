import { of, asyncScheduler } from 'rxjs';
import { expand } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(expand(value => of(value))); // $ExpectType Observable<number>
  const p = of(1, 2, 3).pipe(expand(value => [value])); // $ExpectType Observable<number>
  const q = of(1, 2, 3).pipe(expand(value => Promise.resolve(value))); // $ExpectType Observable<number>
});

it('should infer correctly specifying value argument type', () => {
  const o = of(1).pipe(expand((value: number | string) => of(value.toString()))); // $ExpectType Observable<string | number>
});

it('should infer correctly with specifying different input/output types', () => {
  const o = of(1).pipe(expand<number, string>((value) => of(value.toString()))); // $ExpectType Observable<string | number>
});

it('should enforce project output type to be assignable with its generic', () => {
  const o = of(1).pipe(expand<number, string>((value) => of(value))); // $ExpectError
});

it('should enforce project input type to be assignable with upstream', () => {
  const o = of(1).pipe(expand((value: string) => of(value))); // $ExpectError
});

it('should enforce project input/output types compatibility by default', () => {
  const o = of(1).pipe(expand((value) => of(value.toString()))); // $ExpectError
});

it('should support a project function with index', () => {
  const o = of(1, 2, 3).pipe(expand((value, index) => of(index))); // $ExpectType Observable<number>
});

it('should support concurrent parameter', () => {
  const o = of(1, 2, 3).pipe(expand(value => of(1), 47)); // $ExpectType Observable<number>
});

it('should support a scheduler', () => {
  const o = of(1, 2, 3).pipe(expand(value => of(1), 47, asyncScheduler)); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(expand()); // $ExpectError
});

it('should enforce project types', () => {
  const o = of(1, 2, 3).pipe(expand((value: string, index) => of(1))); // $ExpectError
  const p = of(1, 2, 3).pipe(expand((value, index: string) => of(1))); // $ExpectError
});

it('should enforce project return type', () => {
  const o = of(1, 2, 3).pipe(expand(value => 1)); // $ExpectError
});

it('should enforce concurrent type', () => {
  const o = of(1, 2, 3).pipe(expand(value => of(1), 'foo')); // $ExpectError
});

it('should enforce scheduler type', () => {
  const o = of(1, 2, 3).pipe(expand(value => of(1), 47, 'foo')); // $ExpectError
});

it('should support union types', () => {
  const o = of(1).pipe(expand<string | number>(x => typeof x === 'string' ? of(123) : of('test'))); // $ExpectType Observable<string | number>
});
