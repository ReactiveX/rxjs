import { filter, map, rx, type OperatorFunction, type UnaryFunction } from 'rxjs';

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
void nine;
void unsafeTen;
