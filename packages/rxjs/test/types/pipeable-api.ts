import {
  combineLatest,
  combineLatestWith,
  concat,
  concatWith,
  filter,
  first as firstValue,
  forkJoin,
  iterateBufferedValues,
  iterateEachValue,
  iterateLatestValue,
  iterateNextValue,
  map,
  merge,
  mergeWith,
  pipe,
  rx,
  subscribe,
  take,
  timer,
  toArray,
  type OperatorFunction,
  type Subscription,
  type UnaryFunction,
} from 'rxjs';
import { map as deepMap } from 'rxjs/pipeable/map';
import { buffer as barrelBuffer } from 'rxjs/pipeable';
import { mergeWith as deepMergeWith } from 'rxjs/pipeable/merge-with';
import { rx as deepRx } from 'rxjs/rx';
import { subscribe as deepSubscribe } from 'rxjs/subscribe';
import * as symbols from 'rxjs/symbol';
import { map as mapSymbol } from 'rxjs/symbol/map';
import { toArray as deepToArray } from 'rxjs/to-array';
import { merge as staticMerge } from 'rxjs/static';

const input: ObservableInput<number> = [1, 2, 3];
const stringInput: ObservableInput<string> = ['four', 'five'];
const stringify: OperatorFunction<number, string> = map((value) => String(value));
const positive: OperatorFunction<number, number> = filter((value) => value > 0);
const length: UnaryFunction<string, number> = (value) => value.length;

const strings: Observable<string> = rx(input, positive, stringify);
const finalLength: number = rx(input, positive, stringify, () => 'done', length);

const mixed: ObservableInput<number | string> = [1, 'two'];
const narrowed: Observable<string> = rx(
  mixed,
  filter((value): value is string => typeof value === 'string')
);

const nullable: ObservableInput<0 | 1 | '' | 'value' | null | undefined> = [0, 1, '', 'value', null, undefined];
const truthy: Observable<1 | 'value'> = rx(nullable, filter(Boolean));
const firstTwo: Observable<number> = rx(input, take(2));
const collected: Observable<number[]> = rx(input, take(2), toArray());
const subscription: Subscription = rx(
  input,
  subscribe((value) => value.toFixed())
);
const deepMapped: Observable<string> = deepRx(
  input,
  deepMap((value) => value.toFixed())
);
const deepCollected: Observable<number[]> = deepRx(input, deepToArray());
const deepSubscription: Subscription = deepRx(
  input,
  deepSubscribe((value) => value.toFixed())
);
const symbolMapped: Observable<string> = Observable.from(input)[mapSymbol]((value) => value.toFixed());
const merged: Observable<number | string> = rx(input, mergeWith([['four', 'five']]));
const barrelBuffered: Observable<number[]> = rx(input, barrelBuffer({ maxSize: 2 }));
const deepMerged: Observable<number | string> = rx(input, deepMergeWith([['four', 'five']]));
const concatenated: Observable<number | string> = rx(input, concatWith([['four', 'five']]));
const combined: Observable<[number, string]> = rx(input, combineLatestWith([stringInput] as const));
const staticMerged: Observable<number | string> = merge([[1, 2], ['three']]);
const staticBarrelMerged: Observable<number | string> = staticMerge([[1, 2], ['three']]);
const staticConcatenated: Observable<number | string> = concat([[1, 2], ['three']]);
const staticCombined: Observable<readonly [number, string]> = combineLatest([input, stringInput] as const);
const joined: Observable<[number, string]> = forkJoin([input, Promise.resolve('three')] as const);
const ticking: Observable<number> = timer(1);
const iterated: AsyncGenerator<number, void, void> = rx(input, iterateEachValue());
const bufferedIteration: AsyncGenerator<number[], void, void> = rx(input, iterateBufferedValues());
const latestIteration: AsyncGenerator<number, void, void> = rx(input, iterateLatestValue());
const nextIteration: AsyncGenerator<number, void, void> = rx(input, iterateNextValue());
const firstString: Observable<string> = rx(
  mixed,
  firstValue((value): value is string => typeof value === 'string')
);
const reusable: OperatorFunction<number, string> = pipe(
  take(1),
  map((value) => value.toFixed())
);
const reusableResult: Observable<string> = rx(input, reusable);

const mergeSymbolFromBarrel: typeof import('rxjs/symbol/merge').merge = symbols.merge;

const increment = (value: number) => value + 1;
const initial = (_source: Observable<number>) => 0;
const nine: number = rx(input, initial, increment, increment, increment, increment, increment, increment, increment, increment);
const ten = rx(input, initial, increment, increment, increment, increment, increment, increment, increment, increment, increment);

// @ts-expect-error Chains beyond nine transformations deliberately return unknown.
const unsafeTen: number = ten;

void strings;
void finalLength;
void narrowed;
void truthy;
void firstTwo;
void collected;
void subscription;
void deepMapped;
void deepCollected;
void deepSubscription;
void symbolMapped;
void merged;
void barrelBuffered;
void deepMerged;
void concatenated;
void combined;
void staticMerged;
void staticBarrelMerged;
void staticConcatenated;
void staticCombined;
void joined;
void ticking;
void iterated;
void bufferedIteration;
void latestIteration;
void nextIteration;
void firstString;
void reusableResult;
void mergeSymbolFromBarrel;
void nine;
void unsafeTen;
