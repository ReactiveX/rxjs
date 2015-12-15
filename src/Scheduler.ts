import {Subscription} from './Subscription';
import {Action} from './scheduler/Action';

export interface Scheduler {
  now(): number;
  schedule<T>(work: (state?: any) => Subscription|void, delay?: number, state?: any): Subscription;
  flush(): void;
  actions: Action[];
  scheduled: boolean;
  active: boolean;
}