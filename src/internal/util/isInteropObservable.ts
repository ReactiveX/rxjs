import { InteropObservable } from "../types";
import { symbolObservable } from '../util/symbolObservable';

export function isInteropObservable<T>(obj: any): obj is InteropObservable<T> {
  return typeof obj[symbolObservable] === 'function';
}
