import { InteropObservable } from 'rxjs/internal/types';
import { symbolObservable } from 'rxjs/internal/util/symbolObservable';

export function isInteropObservable<T>(obj: any): obj is InteropObservable<T> {
  return typeof obj[symbolObservable] === 'function';
}
