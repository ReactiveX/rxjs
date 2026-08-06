import { filter, map, rx, subscribe, take, toArray, type OperatorFunction, type Subscription, type UnaryFunction } from 'rxjs';
import { map as deepMap } from 'rxjs/pipeable/map';
import { rx as deepRx } from 'rxjs/rx';
import { subscribe as deepSubscribe } from 'rxjs/subscribe';
import { map as mapSymbol } from 'rxjs/symbol/map';
import { toArray as deepToArray } from 'rxjs/to-array';

const input: ObservableInput<number> = [1, 2, 3];
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

const increment = (value: number) => value + 1;
const first = (_source: Observable<number>) => 0;
const nine: number = rx(input, first, increment, increment, increment, increment, increment, increment, increment, increment);
const ten = rx(input, first, increment, increment, increment, increment, increment, increment, increment, increment, increment);

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
void nine;
void unsafeTen;
