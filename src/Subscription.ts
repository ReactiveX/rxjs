export interface Subscription {
  isUnsubscribed: boolean;
  unsubscribe(): void;
  add(subscription: Subscription): void;
  remove(subscription: Subscription): void;
}