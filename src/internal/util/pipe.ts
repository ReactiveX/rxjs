import { identity } from "rxjs/internal/util/identity";

export function pipe<T>(): (value: T) => T;
export function pipe<A, R>(fnA: (value: A) => R): (value: A) => R;
export function pipe<A, B, R>(fnA: (value: A) => B, fnB: (value: B) => R): (value: A) => R;
export function pipe<A, B, C, R>(fnA: (value: A) => B, fnB: (value: B) => C, fnC: (value: C) => R): (value: A) => R;
export function pipe<A, B, C, D, R>(fnA: (value: A) => B, fnB: (value: B) => C, fnC: (value: C) => D, fnD: (value: D) => R): (value: A) => R;
export function pipe<A, B, C, D, E, R>(fnA: (value: A) => B, fnB: (value: B) => C, fnC: (value: C) => D, fnD: (value: D) => E, fnE: (value: E) => R): (value: A) => R;
export function pipe<A, B, C, D, E, F, R>(fnA: (value: A) => B, fnB: (value: B) => C, fnC: (value: C) => D, fnD: (value: D) => E, fnE: (value: E) => F, fnF: (value: F) => R): (value: A) => R;
export function pipe<A, B, C, D, E, F, G, R>(fnA: (value: A) => B, fnB: (value: B) => C, fnC: (value: C) => D, fnD: (value: D) => E, fnE: (value: E) => F, fnF: (value: F) => G, fnG: (value: G) => R): (value: A) => R;
export function pipe<A, B, C, D, E, F, G, H, R>(fnA: (value: A) => B, fnB: (value: B) => C, fnC: (value: C) => D, fnD: (value: D) => E, fnE: (value: E) => F, fnF: (value: F) => G, fnG: (value: G) => H, fnH: (value: H) => R): (value: A) => R;
export function pipe<A, B, C, D, E, F, G, H, I, R>(fnA: (value: A) => B, fnB: (value: B) => C, fnC: (value: C) => D, fnD: (value: D) => E, fnE: (value: E) => F, fnF: (value: F) => G, fnG: (value: G) => H, fnH: (value: H) => I, fnI: (value: I) => R): (value: A) => R;
export function pipe<A, B, C, D, E, F, G, H, I, J, R>(fnA: (value: A) => B, fnB: (value: B) => C, fnC: (value: C) => D, fnD: (value: D) => E, fnE: (value: E) => F, fnF: (value: F) => G, fnG: (value: G) => H, fnH: (value: H) => I, fnI: (value: I) => J, fnJ: (value: J) => R): (value: A) => R;
export function pipe<A, B, C, D, E, F, G, H, I, J, K, R>(fnA: (value: A) => B, fnB: (value: B) => C, fnC: (value: C) => D, fnD: (value: D) => E, fnE: (value: E) => F, fnF: (value: F) => G, fnG: (value: G) => H, fnH: (value: H) => I, fnI: (value: I) => J, fnJ: (value: J) => K, fnK: (value: K) => R): (value: A) => R;

export function pipe<T>(...fns: Array<(value: T) => T>): (value: T) => T {
  if (fns.length <= 0) {
    return identity;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return (x: T) => fns.reduce((prev, fn) => fn(prev), x);
}
