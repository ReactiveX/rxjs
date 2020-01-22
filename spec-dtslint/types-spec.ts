import {
  Observable,
  ObservedValueOf,
  ObservedValueUnionFromArray,
  ObservedValueTupleFromArray,
  Unshift
} from 'rxjs';
import { A, B, C } from './helpers';

describe('ObservedValueOf', () => {
  it('should infer from an observable', () => {
    let explicit: ObservedValueOf<Observable<A>>;
    let inferred = explicit!; // $ExpectType A
  });

  it('should infer from an array', () => {
    let explicit: ObservedValueOf<A[]>;
    let inferred = explicit!; // $ExpectType A
  });

  it('should infer from a promise', () => {
    let explicit: ObservedValueOf<Promise<A>>;
    let inferred = explicit!; // $ExpectType A
  });
});

describe('ObservedUnionFromArray', () => {
  it('should infer from an array of observables', () => {
    let explicit: ObservedValueUnionFromArray<[Observable<A>, Observable<B>]>;
    let inferred = explicit!; // $ExpectType A | B
  });

  it('should infer from an array of arrays', () => {
    let explicit: ObservedValueUnionFromArray<[A[], B[]]>;
    let inferred = explicit!; // $ExpectType A | B
  });

  it('should infer from an array of promises', () => {
    let explicit: ObservedValueUnionFromArray<[Promise<A>, Promise<B>]>;
    let inferred = explicit!; // $ExpectType A | B
  });
});

describe('ObservedTupleFromArray', () => {
  it('should infer from an array of observables', () => {
    let explicit: ObservedValueTupleFromArray<[Observable<A>, Observable<B>]>;
    let inferred = explicit!; // $ExpectType [A, B]
  });

  it('should infer from an array of arrays', () => {
    let explicit: ObservedValueTupleFromArray<[A[], B[]]>;
    let inferred = explicit!; // $ExpectType [A, B]
  });

  it('should infer from an array of promises', () => {
    let explicit: ObservedValueTupleFromArray<[Promise<A>, Promise<B>]>;
    let inferred = explicit!; // $ExpectType [A, B]
  });
});

describe('Unshift', () => {
  it('should add the type to the beginning of the tuple', () => {
    let tuple: ObservedValueTupleFromArray<[Observable<A>, Observable<B>]>;
    let explicit: Unshift<typeof tuple, C>;
    let inferred = explicit!; // $ExpectType [C, A, B]
  });
});
