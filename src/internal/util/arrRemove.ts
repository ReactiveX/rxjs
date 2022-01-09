/**
 * Removes an item from an array, mutating it.
 * @param arr The array to remove the item from
 * @param item The item to remove
 */
export function arrRemove<T>(arr: T[] | undefined | null, item: T) {
  if (arr) {
    const index = arr.indexOf(item);
    index >= 0 && arr.splice(index, 1);
  }
}
