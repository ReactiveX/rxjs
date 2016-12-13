/**
 * An error thrown when one or more errors have occurred during the
 * `unsubscribe` of a {@link Subscription}.
 */
export class UnsubscriptionError extends Error {
  constructor(public errors: any[]) {
    super(message = errors ?
    `${errors.length} errors occurred during unsubscription:
  ${errors.map((err, i) => `${i + 1}) ${err.toString()}`).join('\n  ')}` : '');

    var message: string;

    Object.defineProperty(this, 'name', {
      enumerable: false,
      writable: false,
      value: 'UnsubscriptionError'
    });

    Object.defineProperty(this, 'message', {
      enumerable: false,
      writable: true,
      value: message
    });

    Object.defineProperty(this, 'stack', {
      enumerable: false,
      writable: false,
      value: (new Error(message)).stack
    });
  }
}

if (typeof (<any>Object).setPrototypeOf === 'function') {
  (<any>Object).setPrototypeOf(UnsubscriptionError.prototype, Error.prototype);
} else {
  UnsubscriptionError.prototype = <any>Object.create(Error.prototype);
}