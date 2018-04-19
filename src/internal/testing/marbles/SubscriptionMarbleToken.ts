/**
 * Defines tokens for marble diagram DSL to represent Observable subscriptions.
 *
 */
export enum SubscriptionMarbleToken {
  /**
   * Subscription started
   */

  SUBSCRIBE = '^',
  /**
   * Unsubscribed.
   *
   */
  UNSUBSCRIBE = '!'
}
