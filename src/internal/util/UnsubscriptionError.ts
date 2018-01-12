/**
 * An error thrown when one or more errors have occurred during the
 * `unsubscribe` of a {@link Subscription}.
 */
export class UnsubscriptionError extends Error {
  constructor(public errors: any[]) {
    super(errors ?
      `${errors.length} errors occurred during unsubscription:
  ${errors.map((err, i) => `${i + 1}) ${err.toString()}`).join('\n  ')}` : '');
    this.name = 'UnsubscriptionError';
    (Object as any).setPrototypeOf(this, UnsubscriptionError.prototype);
  }
}
