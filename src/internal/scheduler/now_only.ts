import { SchedulerLike } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';

export const NOW_ONLY_SCHEDULER: SchedulerLike = {
  schedule(): Subscription {
    throw new Error('not implemented');
  },
  now() {
    return Date.now();
  }
};
