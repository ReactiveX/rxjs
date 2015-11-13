import {Subscription} from './Subscription';

export interface Observer<T> {
  start?: (subscription: Subscription<T>) => void;
  next?: (value: T) => void;
  error?: (err?: any) => void;
  complete?: () => void;
  isUnsubscribed?: boolean;
}