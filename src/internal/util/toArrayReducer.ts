export function toArrayReducer<T>(arr: T[], item: T, index: number) {
  if (index === 0) {
    return [item];
  }
  arr.push(item);
  return arr;
}
