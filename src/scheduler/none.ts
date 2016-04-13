import {RecursiveScheduler} from './RecursiveScheduler';

/**
 * A static instance of a recursive scheduler.
 * This is THE instance. Don't new-up another RecursiveScheduler
 * Use this to force `of` and `from` to have a  completely synchronous behavior.
 * When used, there is a reference check done in most schedulable operations.
 * If the scheduler reference equals this reference, then scheduling is not
 * used at all.
 */
export const none = new RecursiveScheduler();

/** returns whether or not scheduling should be used based on a passed scheduler */
export function isUnscheduled(scheduler: any): boolean {
  return !scheduler || scheduler === none;
}