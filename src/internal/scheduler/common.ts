import { SchedulerLike } from '../types';

export function DEFAULT_NOW() {
  return Date.now();
}

export const __rx_scheduler_overrides__ = {
  scheduler: null as SchedulerLike | null
};