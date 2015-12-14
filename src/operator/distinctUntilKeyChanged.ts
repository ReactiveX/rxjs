import {distinctUntilChanged} from './distinctUntilChanged';

export function distinctUntilKeyChanged<T>(key: string, compare?: (x: any, y: any) => boolean) {
  return distinctUntilChanged.call(this, function(x, y) {
    if (compare) {
      return compare(x[key], y[key]);
    }
    return x[key] === y[key];
  });
}