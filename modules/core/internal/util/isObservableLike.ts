export function isObservableLike(obj: any) {
  return obj && typeof obj.subscribe === 'function';
}
