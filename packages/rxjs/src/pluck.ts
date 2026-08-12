import { map } from './map.js';

type PluckKey = string | number | symbol;
type PluckedValue<T, K extends PluckKey> = T extends null | undefined ? undefined : K extends keyof T ? T[K] : never;

export const pluck: unique symbol = Symbol('pluck');

interface PluckOperator<T> {
  <K1 extends keyof NonNullable<T>>(k1: K1): Observable<PluckedValue<T, K1>>;
  <K1 extends keyof NonNullable<T>, K2 extends keyof NonNullable<PluckedValue<T, K1>>>(k1: K1, k2: K2): Observable<
    PluckedValue<PluckedValue<T, K1>, K2>
  >;
  <
    K1 extends keyof NonNullable<T>,
    K2 extends keyof NonNullable<PluckedValue<T, K1>>,
    K3 extends keyof NonNullable<PluckedValue<PluckedValue<T, K1>, K2>>
  >(
    k1: K1,
    k2: K2,
    k3: K3
  ): Observable<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>>;
  <
    K1 extends keyof NonNullable<T>,
    K2 extends keyof NonNullable<PluckedValue<T, K1>>,
    K3 extends keyof NonNullable<PluckedValue<PluckedValue<T, K1>, K2>>,
    K4 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>>
  >(
    k1: K1,
    k2: K2,
    k3: K3,
    k4: K4
  ): Observable<PluckedValue<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>, K4>>;
  <
    K1 extends keyof NonNullable<T>,
    K2 extends keyof NonNullable<PluckedValue<T, K1>>,
    K3 extends keyof NonNullable<PluckedValue<PluckedValue<T, K1>, K2>>,
    K4 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>>,
    K5 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>, K4>>
  >(
    k1: K1,
    k2: K2,
    k3: K3,
    k4: K4,
    k5: K5
  ): Observable<PluckedValue<PluckedValue<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>, K4>, K5>>;
  <
    K1 extends keyof NonNullable<T>,
    K2 extends keyof NonNullable<PluckedValue<T, K1>>,
    K3 extends keyof NonNullable<PluckedValue<PluckedValue<T, K1>, K2>>,
    K4 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>>,
    K5 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>, K4>>,
    K6 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>, K4>, K5>>
  >(
    k1: K1,
    k2: K2,
    k3: K3,
    k4: K4,
    k5: K5,
    k6: K6
  ): Observable<PluckedValue<PluckedValue<PluckedValue<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>, K4>, K5>, K6>>;
  <
    K1 extends keyof NonNullable<T>,
    K2 extends keyof NonNullable<PluckedValue<T, K1>>,
    K3 extends keyof NonNullable<PluckedValue<PluckedValue<T, K1>, K2>>,
    K4 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>>,
    K5 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>, K4>>,
    K6 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>, K4>, K5>>
  >(
    k1: K1,
    k2: K2,
    k3: K3,
    k4: K4,
    k5: K5,
    k6: K6,
    k7: PluckKey,
    ...rest: PluckKey[]
  ): Observable<unknown>;
}

declare global {
  interface Observable<T> {
    [pluck]: PluckOperator<T>;
  }
}

function pluckOperator<T, K1 extends keyof NonNullable<T>>(this: Observable<T>, k1: K1): Observable<PluckedValue<T, K1>>;
function pluckOperator<T, K1 extends keyof NonNullable<T>, K2 extends keyof NonNullable<PluckedValue<T, K1>>>(
  this: Observable<T>,
  k1: K1,
  k2: K2
): Observable<PluckedValue<PluckedValue<T, K1>, K2>>;
function pluckOperator<
  T,
  K1 extends keyof NonNullable<T>,
  K2 extends keyof NonNullable<PluckedValue<T, K1>>,
  K3 extends keyof NonNullable<PluckedValue<PluckedValue<T, K1>, K2>>
>(this: Observable<T>, k1: K1, k2: K2, k3: K3): Observable<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>>;
function pluckOperator<
  T,
  K1 extends keyof NonNullable<T>,
  K2 extends keyof NonNullable<PluckedValue<T, K1>>,
  K3 extends keyof NonNullable<PluckedValue<PluckedValue<T, K1>, K2>>,
  K4 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>>
>(
  this: Observable<T>,
  k1: K1,
  k2: K2,
  k3: K3,
  k4: K4
): Observable<PluckedValue<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>, K4>>;
function pluckOperator<
  T,
  K1 extends keyof NonNullable<T>,
  K2 extends keyof NonNullable<PluckedValue<T, K1>>,
  K3 extends keyof NonNullable<PluckedValue<PluckedValue<T, K1>, K2>>,
  K4 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>>,
  K5 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>, K4>>
>(
  this: Observable<T>,
  k1: K1,
  k2: K2,
  k3: K3,
  k4: K4,
  k5: K5
): Observable<PluckedValue<PluckedValue<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>, K4>, K5>>;
function pluckOperator<
  T,
  K1 extends keyof NonNullable<T>,
  K2 extends keyof NonNullable<PluckedValue<T, K1>>,
  K3 extends keyof NonNullable<PluckedValue<PluckedValue<T, K1>, K2>>,
  K4 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>>,
  K5 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>, K4>>,
  K6 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>, K4>, K5>>
>(
  this: Observable<T>,
  k1: K1,
  k2: K2,
  k3: K3,
  k4: K4,
  k5: K5,
  k6: K6
): Observable<PluckedValue<PluckedValue<PluckedValue<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>, K4>, K5>, K6>>;
function pluckOperator<
  T,
  K1 extends keyof NonNullable<T>,
  K2 extends keyof NonNullable<PluckedValue<T, K1>>,
  K3 extends keyof NonNullable<PluckedValue<PluckedValue<T, K1>, K2>>,
  K4 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>>,
  K5 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>, K4>>,
  K6 extends keyof NonNullable<PluckedValue<PluckedValue<PluckedValue<PluckedValue<PluckedValue<T, K1>, K2>, K3>, K4>, K5>>
>(this: Observable<T>, k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, k7: PluckKey, ...rest: PluckKey[]): Observable<unknown>;
function pluckOperator<T>(this: Observable<T>, ...properties: PluckKey[]): Observable<unknown> {
  if (properties.length === 0) {
    throw new Error('list of properties cannot be empty.');
  }

  return this[map]((value) => {
    let current: unknown = value;

    for (const property of properties) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = Reflect.get(Object(current), property);
    }

    return current;
  });
}

Observable.prototype[pluck] = pluckOperator;
