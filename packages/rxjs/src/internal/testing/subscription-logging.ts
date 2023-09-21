interface SubscriptionLoggingProps {
  subscriptions: SubscriptionLog[];
  scheduler: { now(): number };
}

export class SubscriptionLog {
  constructor(public subscribedFrame: number, public unsubscribedFrame: number = Infinity) {}
}

export function logUnsubscribedFrame(this: SubscriptionLoggingProps, index: number) {
  const subscriptionLogs = this.subscriptions;
  const oldSubscriptionLog = subscriptionLogs[index];
  subscriptionLogs[index] = new SubscriptionLog(oldSubscriptionLog.subscribedFrame, this.scheduler.now());
}

export function logSubscribedFrame(this: SubscriptionLoggingProps): number {
  this.subscriptions.push(new SubscriptionLog(this.scheduler.now()));
  return this.subscriptions.length - 1;
}
