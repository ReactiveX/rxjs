import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { distinctUntilChanged } from 'rxjs/operators';

interface Person { name: string; }
const sample: Person = { name: 'Tim' };

it('should infer correctly', () => {
  expectType<Observable<Person>>(of(sample).pipe(distinctUntilChanged()));
});

it('should accept a compare', () => {
  expectType<Observable<Person>>(of(sample).pipe(distinctUntilChanged((p1, p2) => p1.name === p2.name)));
});

it('should accept a keySelector', () => {
  expectType<Observable<Person>>(of(sample).pipe(distinctUntilChanged((name1, name2) => name1 === name2, p => p.name)));
});

it('should enforce types', () => {
  expectError(of(sample).pipe(distinctUntilChanged('F00D')));
});

it('should enforce types of compare', () => {
  expectError(of(sample).pipe(distinctUntilChanged((p1, p2) => p1.foo === p2.name)));
  expectError(of(sample).pipe(distinctUntilChanged((p1, p2) => p1.name === p2.foo)));
});

it('should enforce types of keySelector', () => {
  expectError(of(sample).pipe(distinctUntilChanged((name1 , name2) => name1 === name2, p => p.foo)));
});

it('should enforce types of compare in combination with keySelector', () => {
  expectError(of(sample).pipe(distinctUntilChanged((name1: number, name2) => name1 === name2, p => p.name)));
  expectError(of(sample).pipe(distinctUntilChanged((name1, name2: number) => name1 === name2, p => p.name)));
});
