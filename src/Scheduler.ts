import {Subscription} from './Subscription';
import {Action} from './scheduler/Action';

export interface Scheduler {
  now(): number;
  schedule<T>(work: (state?: T) => Subscription | void, delay?: number, state?: T): Subscription;
  flush(): void;
  active: boolean;
  actions: Action<any>[]; // XXX: use `any` to remove type param `T` from `Scheduler`.
  scheduledId: number;
}
