export function compose<A, B, C>(
  fnA: (a: A) => B, fnB: (b: B) => C): (a: A) => C;
export function compose<A, B, C, D>(
  fnA: (a: A) => B, fnB: (b: B) => C, fnC: (c: C) => D): (a: A) => D;
export function compose<A, B, C, D>(
  fnA: (a: A) => B, fnB: (b: B) => C, fnC: (c: C) => D): (a: A) => D;
export function compose<A, B, C, D, E>(
  fnA: (a: A) => B, fnB: (b: B) => C, fnC: (c: C) => D,
  fnD: (d: D) => E): (a: A) => E;
export function compose<A, B, C, D, E, F>(
  fnA: (a: A) => B, fnB: (b: B) => C, fnC: (c: C) => D,
  fnD: (d: D) => E, fnE: (e: E) => F): (a: A) => F;
export function compose<A, B, C, D, E, F, G>(
  fnA: (a: A) => B, fnB: (b: B) => C, fnC: (c: C) => D,
  fnD: (d: D) => E, fnE: (e: E) => F, fnF: (f: F) => G): (a: A) => G;
export function compose<A, B, C, D, E, F, G, H>(
  fnA: (a: A) => B, fnB: (b: B) => C, fnC: (c: C) => D,
  fnD: (d: D) => E, fnE: (e: E) => F, fnF: (f: F) => G,
  fnG: (g: G) => H): (a: A) => H;
export function compose<A, B, C, D, E, F, G, H, I>(
  fnA: (a: A) => B, fnB: (b: B) => C, fnC: (c: C) => D,
  fnD: (d: D) => E, fnE: (e: E) => F, fnF: (f: F) => G,
  fnG: (g: G) => H, fnH: (h: H) => I): (a: A) => I;
export function compose<A, B, C, D, E, F, G, H, I, J>(
  fnA: (a: A) => B, fnB: (b: B) => C, fnC: (c: C) => D,
  fnD: (d: D) => E, fnE: (e: E) => F, fnF: (f: F) => G,
  fnG: (g: G) => H, fnH: (h: H) => I, fnJ: (i: I) => J): (a: A) => J;
export function compose(...fns: any[]): (value: any) => any;

export function compose(...fns: any[]): any {
    return (t: any) => fns.reduce((prev, fn) => fn(prev), t);
}