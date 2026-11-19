import 'rxjs';
import { combineLatest } from 'rxjs/combine-latest';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;

declare const a: Observable<number>;
declare const b: Observable<string>;
declare const receiver: Observable<boolean>;
declare const array: (Observable<number> | Observable<string>)[];
declare const readonlyArray: readonly (Observable<number> | Observable<string>)[];

const tuple = Observable[combineLatest]([a, b]);
type Tuple = Assert<Equal<typeof tuple, Observable<[number, string]>>>;
tuple.subscribe(([n, s]) => {
  const x: number = n;
  const y: string = s;
});

const configured = Observable[combineLatest]([a, b], { requireAllValues: true });
type Configured = Assert<Equal<typeof configured, Observable<[number, string]>>>;

const readonlyTuple = Observable[combineLatest]([a, b] as const);
type ReadonlyTuple = Assert<Equal<typeof readonlyTuple, Observable<readonly [number, string]>>>;

const arrayResult = Observable[combineLatest](array);
type ArrayResult = Assert<Equal<typeof arrayResult, Observable<(number | string)[]>>>;
const readonlyArrayResult = Observable[combineLatest](readonlyArray);
type ReadonlyArrayResult = Assert<Equal<typeof readonlyArrayResult, Observable<readonly (number | string)[]>>>;

const object = Observable[combineLatest]({ count: a, label: b });
type ObjectResult = Assert<Equal<typeof object, Observable<{ count: number; label: string }>>>;

const empty = Observable[combineLatest]([]);
type Empty = Assert<Equal<typeof empty, Observable<[]>>>;

const projected = Observable[combineLatest]([a, b], (n, s) => n.toFixed() + s.toUpperCase());
type Projected = Assert<Equal<typeof projected, Observable<string>>>;

const instance = receiver[combineLatest]([a, b]);
type Instance = Assert<Equal<typeof instance, Observable<[boolean, number, string]>>>;
const instanceProjected = receiver[combineLatest]([a, b], (enabled, n, s) => (enabled ? n.toFixed() + s.toUpperCase() : ''));
type InstanceProjected = Assert<Equal<typeof instanceProjected, Observable<string>>>;

// @ts-expect-error Each source must be an ObservableValue.
Observable[combineLatest]([a, 42]);
