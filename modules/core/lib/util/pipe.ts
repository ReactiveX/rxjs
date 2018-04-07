export function pipe<T>(...fns: Array<(v: T) => T>): (v: T) => T {
  return (x: T) => fns.reduce((prev, fn) => fn(prev), x);
}