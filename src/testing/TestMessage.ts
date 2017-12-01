import { Notification } from '../internal/Notification';

export interface TestMessage {
  frame: number;
  notification: Notification<any>;
}
