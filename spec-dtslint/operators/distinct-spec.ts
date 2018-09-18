import { of } from 'rxjs';
import { distinct } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(distinct()); // $ExpectType Observable<number>
});

it('should accept a keySelector', () => {
  interface Person { name: string; }
  const o = of<Person>({ name: 'Tim' }).pipe(distinct(person => person.name)); // $ExpectType Observable<Person>
});

it('should accept flushes', () => {
  const o = of(1, 2, 3).pipe(distinct(n => n, of('t', 'i', 'm'))); // $ExpectType Observable<number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(distinct('F00D')); // $ExpectError
});

it('should enforce types of keySelector', () => {
  const o = of<{ id: string; }>({id: 'F00D'}).pipe(distinct(item => item.foo)); // $ExpectError
});
