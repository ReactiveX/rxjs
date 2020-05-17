import { of, Subject, GroupedObservable } from 'rxjs';
import { groupBy, mergeMap } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(groupBy(value => value.toString())); // $ExpectType Observable<GroupedObservable<string, number>>
});

it('should support an element selector', () => {
  const o = of(1, 2, 3).pipe(groupBy(value => value.toString(), value => Boolean(value))); // $ExpectType Observable<GroupedObservable<string, boolean>>
});

it('should support a duration selector', () => {
  const o = of(1, 2, 3).pipe(groupBy(value => value.toString(), undefined, (value: GroupedObservable<string, number>) => of(true, false))); // $ExpectType Observable<GroupedObservable<string, number>>
});

it('should infer type of duration selector based on element selector', () => {
  /* tslint:disable-next-line:max-line-length */
  const o = of(1, 2, 3).pipe(groupBy(value => value.toString(), value => Boolean(value), (value: GroupedObservable<string, boolean>) => value)); // $ExpectType Observable<GroupedObservable<string, boolean>>
});

it('should support a subject selector', () => {
  const o = of(1, 2, 3).pipe(groupBy(value => value.toString(), undefined, undefined, () => new Subject<boolean>())); // $ExpectType Observable<GroupedObservable<string, boolean>>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(groupBy()); // $ExpectError
});

it('should enforce type of key selector', () => {
  const o = of(1, 2, 3).pipe(groupBy('nope')); // $ExpectError
});

it('should enforce types of element selector', () => {
  const o = of(1, 2, 3).pipe(groupBy(value => value, 'foo')); // $ExpectError
  const p = of(1, 2, 3).pipe(groupBy(value => value, (value: string) => value)); // $ExpectError
});

it('should enforce types of duration selector', () => {
  const o = of(1, 2, 3).pipe(groupBy(value => value.toString(), undefined, value => 'foo')); // $ExpectError
  const p = of(1, 2, 3).pipe(groupBy(value => value.toString(), undefined, (value: GroupedObservable<number, number>) => value)); // $ExpectError
  const q = of(1, 2, 3).pipe(groupBy(value => value.toString(), undefined, (value: GroupedObservable<string, string>) => value)); // $ExpectError
  const r = of(1, 2, 3).pipe(groupBy(value => value.toString(), value => Boolean(value), (value: GroupedObservable<string, string>) => value)); // $ExpectError
  const s = of(1, 2, 3).pipe(groupBy(value => value.toString(), value => Boolean(value), (value: GroupedObservable<boolean, boolean>) => value)); // $ExpectError
});

it('should enforce types of subject selector', () => {
  const o = of(1, 2, 3).pipe(groupBy(value => value.toString(), undefined, undefined, () => 'nope')); // $ExpectError
  const p = of(1, 2, 3).pipe(groupBy(value => value.toString(), undefined, undefined, (value) => new Subject<string>())); // $ExpectError
});

it('should support a user-defined type guard', () => {
  function isNumber(value: string | number): value is number {
    return typeof value === 'number';
  }
  const o = of('a', 1, 'b', 2).pipe(
    groupBy(isNumber),
    mergeMap((group) => {
      if (group.key) {
        const inferred = group; // $ExpectType GroupedObservable<true, number>
        return inferred;
      } else {
        const inferred = group; // $ExpectType GroupedObservable<false, string>
        return inferred;
      }
    })
  );
  const inferred = o; // $ExpectType Observable<string | number>
});

it('should support an inline user-defined type guard', () => {
  const o = of('a', 1, 'b', 2).pipe(
    groupBy((value): value is number => typeof value === 'number'),
    mergeMap((group) => {
      if (group.key) {
        const inferred = group; // $ExpectType GroupedObservable<true, number>
        return inferred;
      } else {
        const inferred = group; // $ExpectType GroupedObservable<false, string>
        return inferred;
      }
    })
  );
  const inferred = o; // $ExpectType Observable<string | number>
});
