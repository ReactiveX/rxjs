export function isObservableLike(obj: any) {
  return obj != null && typeof obj.subscribe === 'function';
}
