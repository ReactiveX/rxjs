import { InteropObservable } from "rxjs/internal/types";

export function isInteropObservable<T>(obj: any): obj is InteropObservable<T> {
  return typeof obj[Symbol.observable] === 'function';
}
