import type { ObservableNotification } from '../types.js';

export interface TestMessage {
  frame: number;
  notification: ObservableNotification<any>;
  isGhost?: boolean;
}
