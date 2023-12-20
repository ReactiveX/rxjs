import type {
  Observable,
  ObservedValueOf,
  ObservedValueUnionFromArray,
  ObservedValueTupleFromArray,
  Cons,
  Head,
  Tail
} from 'rxjs';
import type { A, B, C } from './helpers';

describe('ObservedValueOf', () => {
  it('should infer from an observable', () => {
    let explicit: ObservedValueOf<Observable<A>>;
    const inferred = explicit!; // $ExpectType A
  });

  it('should infer from an array', () => {
    let explicit: ObservedValueOf<A[]>;
    const inferred = explicit!; // $ExpectType A
  });

  it('should infer from a promise', () => {
    let explicit: ObservedValueOf<Promise<A>>;
    const inferred = explicit!; // $ExpectType A
  });
});

describe('ObservedUnionFromArray', () => {
  it('should infer from an array of observables', () => {
    let explicit: ObservedValueUnionFromArray<[Observable<A>, Observable<B>]>;
    const inferred = explicit!; // $ExpectType A | B
  });

  it('should infer from an array of arrays', () => {
    let explicit: ObservedValueUnionFromArray<[A[], B[]]>;
    const inferred = explicit!; // $ExpectType A | B
  });

  it('should infer from an array of promises', () => {
    let explicit: ObservedValueUnionFromArray<[Promise<A>, Promise<B>]>;
    const inferred = explicit!; // $ExpectType A | B
  });
});

describe('ObservedTupleFromArray', () => {
  it('should infer from an array of observables', () => {
    let explicit: ObservedValueTupleFromArray<[Observable<A>, Observable<B>]>;
    const inferred = explicit!; // $ExpectType [A, B]
  });

  it('should infer from an array of arrays', () => {
    let explicit: ObservedValueTupleFromArray<[A[], B[]]>;
    const inferred = explicit!; // $ExpectType [A, B]
  });

  it('should infer from an array of promises', () => {
    let explicit: ObservedValueTupleFromArray<[Promise<A>, Promise<B>]>;
    const inferred = explicit!; // $ExpectType [A, B]
  });
});

describe('Cons', () => {
  it('should construct a tuple with the specified type at the head', () => {
    let explicit: Cons<A, [B, C]>;
    const inferred = explicit!; // $ExpectType [A, B, C]
  });

  it('should support rest tuples', () => {
    let explicit: Cons<A, B[]>;
    const inferred = explicit!; // $ExpectType [arg: A, ...rest: B[]]
  });
});

describe('Head', () => {
  it('should return the head of a tuple', () => {
    let explicit: Head<[A, B, C]>;
    const inferred = explicit!; // $ExpectType A
  });
});

describe('Tail', () => {
  it('should return the tail of a tuple', () => {
    let explicit: Tail<[A, B, C]>;
    const inferred = explicit!; // $ExpectType [B, C]
  });
});
