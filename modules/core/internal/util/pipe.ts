import { noop } from "./noop";

export function pipe<T>(...fns: Array<(value: T) => T>): (value: T) => T {
  return fns.length > 0
    ? (x: T) => fns.reduce((prev, fn) => fn(prev), x)
    : noop as any;
}
