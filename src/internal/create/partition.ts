import { filter } from 'rxjs/internal/operators/filter';
import { Observable } from 'rxjs/internal/Observable';


export function partition<T>(source: Observable<T>, predicate: (value: T, index: number) => boolean) {
  return [
    source.pipe(filter(predicate)),
    source.pipe(filter((v, i) => !predicate(v, i))),
  ];
}
