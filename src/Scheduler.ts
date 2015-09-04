import Subscription from './Subscription';

interface Scheduler {
  now(): number;
  
  schedule<T>(work: (state?: any) => Subscription<T>|void, delay?: number, state?: any): Subscription<T>;
}

export default Scheduler;