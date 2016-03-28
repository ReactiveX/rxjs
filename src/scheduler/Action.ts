import {Subscription, SubscriptionList} from '../Subscription';
import {Scheduler} from '../Scheduler';

export interface Action extends SubscriptionList {
  work: (state?: any) => void|Subscription;
  state?: any;
  delay?: number;
  schedule(state?: any, delay?: number): void;
  execute(): void;
  scheduler: Scheduler;
  error: any;
}