import {INotification} from '../Notification';

export interface TestMessage {
  frame: number;
  notification: INotification<any>;
}