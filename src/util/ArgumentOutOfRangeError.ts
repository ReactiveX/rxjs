export class ArgumentOutOfRangeError extends Error {
  constructor() {
    super('argument out of range');
    this.name = 'ArgumentOutOfRangeError';
  }
}