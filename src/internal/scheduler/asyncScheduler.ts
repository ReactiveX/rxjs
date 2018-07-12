import { Subscription } from '../Subscription';
import { Scheduler } from '../types';

export const asyncScheduler: Scheduler = {
  now() {
    return Date.now();
  },
  schedule<T>(work: (state: T) => void, delay: number, state: T, subs: Subscription) {
    let id = setTimeout(() => work(state), delay);
    subs.add(() => clearTimeout(id));
  }
}