import {Subscription} from '../Subscription';
import {Scheduler} from '../Scheduler';

export interface Action<T> extends Subscription {
  work: (state?: T) => void|Subscription;
  state?: T;
  delay?: number;
  schedule(state?: T, delay?: number): void;
  execute(): void;
  scheduler: Scheduler;
  error: any;
}