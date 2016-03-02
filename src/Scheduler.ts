import {Subscription} from './Subscription';
import {Action} from './scheduler/Action';

export interface Scheduler {
  now(): number;
  schedule<T>(work: (state?: T) => Subscription | void, delay?: number, state?: T): Subscription;
  flush(): void;
  active: boolean;
  actions: Action[];
  scheduledId: number;
}
