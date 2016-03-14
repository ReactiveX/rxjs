import {Subscription} from '../Subscription';
import {Scheduler} from '../Scheduler';

export interface Action extends Subscription {
  work: (state?: any) => void|Subscription;
  state?: any;
  delay?: number;
  schedule(state?: any, delay?: number): void;
  execute(): void;
  scheduler: Scheduler;
  error: any;
}