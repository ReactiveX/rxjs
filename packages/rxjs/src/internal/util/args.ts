import type { SchedulerLike } from '../types.js';
import { isFunction } from '@rxjs/observable';
import { isScheduler } from './isScheduler.js';

function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

export function popResultSelector(args: any[]): ((...args: unknown[]) => unknown) | undefined {
  return isFunction(last(args)) ? args.pop() : undefined;
}

export function popScheduler(args: any[]): SchedulerLike | undefined {
  return isScheduler(last(args)) ? args.pop() : undefined;
}

export function popNumber(args: any[], defaultValue: number): number {
  return typeof last(args) === 'number' ? args.pop()! : defaultValue;
}
