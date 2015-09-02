import Subscription from './Subscription';

interface Scheduler {
  now(): number;
  
  schedule<T>(delay: number, state: any, work: (state?: any) => Subscription<T>|void): Subscription<T>;
}

export default Scheduler;