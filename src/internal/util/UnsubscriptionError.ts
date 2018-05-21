/**
 * An error thrown when one or more errors have occurred during the
 * `unsubscribe` of a {@link Subscription}.
 */
export class UnsubscriptionError extends Error {

  public readonly name = 'UnsubscriptionError';

  constructor(public errors: any[]) {
    super(errors ?
      `${errors.length} errors occurred during unsubscription:
  ${errors.map((err, i) => `${i + 1}) ${err.toString()}`).join('\n  ')}` : '');
    (Object as any).setPrototypeOf(this, UnsubscriptionError.prototype);
  }
}
