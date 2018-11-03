import { OperatorFunction, ObservableInput } from "rxjs/internal/types";
import { pipe } from "rxjs/internal/util/pipe";
import { toArray } from "rxjs/internal/operators/derived/toArray";
import { mergeMap } from "rxjs/internal/operators/mergeMap";
import { zip } from "rxjs/internal/create/zip";


export function zipAll<T>(): OperatorFunction<ObservableInput<T>, T[]> {
  return pipe(
    toArray(),
    mergeMap(sources => zip(...sources) as any),
  );
}
