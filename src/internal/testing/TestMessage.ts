import { ObservableNotification } from '../types';

export interface TestMessage {
  frame: number;
  notification: ObservableNotification<any>;
  subscribing: boolean;
}
