/**
 * An error thrown when one or more errors have occurred during the
 * `unsubscribe` of a {@link Subscription}.
 */
export class UnsubscriptionError extends Error {
  name = 'UnsubscriptionError';

  constructor(readonly errors: unknown[]) {
    let message = `${errors.length} errors occurred during unsubscription:`;
    let index = 1;

    for (const error of errors) {
      message += `\n  ${index++}) ${String(error)}`;
    }

    super(message);
  }
}
