import Subscription from '../Subscription';

interface Action extends Subscription<any> {
  work: (state?: any) => void|Subscription<any>
  state: any;
  delay?: number;
  schedule(state: any);
  execute(): void;
}

export default Action;