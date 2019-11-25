import { of, Subject, GroupedObservable, Observable } from 'rxjs';
import { expectType, expectError } from 'tsd';
import { groupBy } from 'rxjs/operators';

it('should infer correctly', () => {
  expectType<Observable<GroupedObservable<string, number>>>(of(1, 2, 3).pipe(groupBy(value => value.toString())));
});

it('should support an element selector', () => {
  expectType<Observable<GroupedObservable<string, boolean>>>(of(1, 2, 3).pipe(groupBy(value => value.toString(), value => Boolean(value))));
});

it('should support a duration selector', () => {
  expectType<Observable<GroupedObservable<string, number>>>(of(1, 2, 3).pipe(groupBy(value => value.toString(), undefined, (value: GroupedObservable<string, number>) => of(true, false))));
});

it('should infer type of duration selector based on element selector', () => {
  /* tslint:disable-next-line:max-line-length */
  expectType<Observable<GroupedObservable<string, boolean>>>(of(1, 2, 3).pipe(groupBy(value => value.toString(), value => Boolean(value), (value: GroupedObservable<string, boolean>) => value)));
});

it('should support a subject selector', () => {
  expectType<Observable<GroupedObservable<string, boolean>>>(of(1, 2, 3).pipe(groupBy(value => value.toString(), undefined, undefined, () => new Subject<boolean>())));
});

it('should enforce types', () => {
  expectError(of(1, 2, 3).pipe(groupBy()));
});

it('should enforce type of key selector', () => {
  expectError(of(1, 2, 3).pipe(groupBy('nope')));
});

it('should enforce types of element selector', () => {
  expectError(of(1, 2, 3).pipe(groupBy(value => value, 'foo')));
  expectError(of(1, 2, 3).pipe(groupBy(value => value, (value: string) => value)));
});

it('should enforce types of duration selector', () => {
  expectError(of(1, 2, 3).pipe(groupBy(value => value.toString(), undefined, value => 'foo')));
  expectError(of(1, 2, 3).pipe(groupBy(value => value.toString(), undefined, (value: GroupedObservable<number, number>) => value)));
  expectError(of(1, 2, 3).pipe(groupBy(value => value.toString(), undefined, (value: GroupedObservable<string, string>) => value)));
  expectError(of(1, 2, 3).pipe(groupBy(value => value.toString(), value => Boolean(value), (value: GroupedObservable<string, string>) => value)));
  expectError(of(1, 2, 3).pipe(groupBy(value => value.toString(), value => Boolean(value), (value: GroupedObservable<boolean, boolean>) => value)));
});

it('should enforce types of subject selector', () => {
  expectError(of(1, 2, 3).pipe(groupBy(value => value.toString(), undefined, undefined, () => 'nope')));
  expectError(of(1, 2, 3).pipe(groupBy(value => value.toString(), undefined, undefined, (value) => new Subject<string>())));
});
