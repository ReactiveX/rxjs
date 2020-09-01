/** @prettier */

export function createErrorClass<T>(name: string, setup: (this: Error, ...args: any[]) => void): T {
  function ErrorImpl(this: Error, ...args: any[]) {
    Error.call(this);
    this.stack = new Error().stack;
    this.name = name;
    setup.apply(this, args);
    return this;
  }

  ErrorImpl.prototype = Object.create(Error.prototype);

  return ErrorImpl as any;
}
