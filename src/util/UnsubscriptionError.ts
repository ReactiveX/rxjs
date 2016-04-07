/**
 * An error thrown when one or more errors have occurred during the
 * `unsubscribe` of a {@link Subscription}.
 */
export class UnsubscriptionError extends Error {
  constructor(public errors: any[]) {
    super('unsubscriptoin error(s)');
    this.name = 'UnsubscriptionError';
  }
}