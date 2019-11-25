import { of, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { distinct } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(distinct()));
});

it('should accept a keySelector', () => {
  interface Person { name: string; }
  expectType<Observable<Person>>(of({ name: 'Tim' } as Person).pipe(distinct(person => person.name)));
});

it('should accept flushes', () => {
  expectType<Observable<number>>(of(1, 2, 3).pipe(distinct(n => n, of('t', 'i', 'm'))));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(distinct('F00D')));
});

it('should enforce types of keySelector', () => {
  expectError(of<{ id: string; }>({id: 'F00D'}).pipe(distinct(item => item.foo)));
});
