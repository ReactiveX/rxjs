import { of, BehaviorSubject, Subject, GroupedObservable } from 'rxjs';
import { buckets, groupBy, mergeMap } from 'rxjs/operators';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(buckets(3)); // $ExpectType Observable<Observable<number>[]>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(buckets()); // $ExpectError
  const p = of(1, 2, 3).pipe(buckets(false)); // $ExpectError
});

it('should support a hash function', () => {
  const o = of(1, 2, 3).pipe(buckets(3, { hashFn: (value) => value + 1 })); // $ExpectType Observable<Observable<number>[]>
  const p = of('foo', 'bar').pipe(buckets(3, { hashFn: (value) => value.length })); // $ExpectType Observable<Observable<string>[]>
});

it('should enforce type of hash function', () => {
  const o = of(1, 2, 3).pipe(buckets(3, { hashFn: null })); // $ExpectError
  const p = of(1, 2, 3).pipe(buckets(3, { hashFn: (value) => Number(value === '1') })); // $ExpectError
  const q = of(1, 2, 3).pipe(buckets(3, { hashFn: (value) => String(value) })); // $ExpectError
});

it('should support a connector factory', () => {
  const o = of(1, 2, 3).pipe(buckets(3, { connector: (bucketIndex) => bucketIndex === 0 ? new BehaviorSubject(3) : new Subject() })); // $ExpectType Observable<Observable<number>[]>
  const p = of('foo', 'bar').pipe(buckets(3, { connector: (bucketIndex) => new BehaviorSubject(String(bucketIndex)) })); // $ExpectType Observable<Observable<string>[]>
});

it('should enforce type of connector factory', () => {
  const o = of(1, 2, 3).pipe(buckets(3, { connector: null })); // $ExpectError
  const p = of(1, 2, 3).pipe(buckets(3, { connector: (bucketIndex) => new Error(String(bucketIndex)) })); // $ExpectError
  const q = of(1, 2, 3).pipe(buckets(3, { connector: (bucketIndex) => new BehaviorSubject(Number(bucketIndex === '1')) })); // $ExpectError
  const r = of(1, 2, 3).pipe(buckets(3, { connector: (bucketIndex) => new BehaviorSubject(bucketIndex === 0 ? 'bar' : 'baz') })); // $ExpectError
});
