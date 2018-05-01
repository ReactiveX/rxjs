export function isObserver(obj: any) {
  return obj != null &&
    typeof obj.next === 'function' &&
    typeof obj.error === 'function' &&
    typeof obj.complete === 'function';
}
