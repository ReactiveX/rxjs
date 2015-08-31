export default function isPromise(x): boolean {
  return x && typeof x.then === 'function';
}