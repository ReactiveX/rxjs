import distinctUntilChanged from '../distinctUntilChanged';

export default function distinctUntilKeyChanged<T>(key: string, compare?: (x: any, y: any) => boolean, thisArg?: any) {
  return distinctUntilChanged.call(this, function(x, y) {
    if (compare) {
      return compare.call(thisArg, x[key], y[key]);
    }
    return x[key] === y[key];
  });
}
