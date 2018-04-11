export function pipe<T>(...fns: Array<(value: T) => T>) {
  return (x: T) => fns.reduce((prev, fn) => fn(prev), x);
}
