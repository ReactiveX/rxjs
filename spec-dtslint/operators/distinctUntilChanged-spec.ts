import { of } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

interface Person { name: string; }
const sample: Person = { name: 'Tim' };

it('should infer correctly', () => {
  const o = of(sample).pipe(distinctUntilChanged()); // $ExpectType Observable<Person>
});

it('should accept a compare', () => {
  const o = of(sample).pipe(distinctUntilChanged((p1, p2) => p1.name === p2.name)); // $ExpectType Observable<Person>
});

it('should accept a keySelector', () => {
  const o = of(sample).pipe(distinctUntilChanged((name1, name2) => name1 === name2, p => p.name)); // $ExpectType Observable<Person>
});

it('should enforce types', () => {
  const o = of(sample).pipe(distinctUntilChanged('F00D')); // $ExpectError
});

it('should enforce types of compare', () => {
  const o = of(sample).pipe(distinctUntilChanged((p1, p2) => p1.foo === p2.name)); // $ExpectError
  const p = of(sample).pipe(distinctUntilChanged((p1, p2) => p1.name === p2.foo)); // $ExpectError
});

it('should enforce types of keySelector', () => {
  const o = of(sample).pipe(distinctUntilChanged((name1 , name2) => name1 === name2, p => p.foo)); // $ExpectError
});

it('should enforce types of compare in combination with keySelector', () => {
  const o = of(sample).pipe(distinctUntilChanged((name1: number, name2) => name1 === name2, p => p.name)); // $ExpectError
  const p = of(sample).pipe(distinctUntilChanged((name1, name2: number) => name1 === name2, p => p.name)); // $ExpectError
});
