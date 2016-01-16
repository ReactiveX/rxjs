export class EmptyError extends Error {
  constructor() {
    super('no elements in sequence');
    this.name = 'EmptyError';
  }
}