import {Subscription} from './Subscription';
import {Action} from './schedulers/Action';

export interface Scheduler {
  now(): number;
  schedule<T>(work: (state?: any) => Subscription<T>|void, delay?: number, state?: any): Subscription<T>;
  flush(): void;
  actions: Action[];
  scheduled: boolean;
  active: boolean;
}