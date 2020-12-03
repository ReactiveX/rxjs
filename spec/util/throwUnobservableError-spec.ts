import { expect } from 'chai';
import { createInvalidObservableTypeError } from '../../src/internal/util/throwUnobservableError';
import { from } from 'rxjs';

/** @test {createInvalidObservableTypeError} */
describe('createInvalidObservableTypeError', () => {
  /** JSON types **/
  it('Should handle a string', () => {
    const error = createInvalidObservableTypeError('FooBar');
    expect(error.message).to.match(/^You provided 'FooBar' where a stream was expected./);
  });
  it('Should handle a boolean', () => {
    const error = createInvalidObservableTypeError(true);
    expect(error.message).to.match(/^You provided 'true' where a stream was expected./);
  });
  it('Should handle a number', () => {
    const error = createInvalidObservableTypeError(12.34);
    expect(error.message).to.match(/^You provided '12.34' where a stream was expected./);
  });
  it('Should handle null', () => {
    const error = createInvalidObservableTypeError(null);
    expect(error.message).to.match(/^You provided 'null' where a stream was expected./);
  });
  it('Should handle an Array', () => {
    const error = createInvalidObservableTypeError([]);
    expect(error.message).to.match(/^You provided an invalid object where a stream was expected./);
  });
  it('Should handle an object literal', () => {
    const error = createInvalidObservableTypeError({
      foo: 'bar',
      fiz: 'buz',
    });
    expect(error.message).to.match(/^You provided an invalid object where a stream was expected./);
  });

  /** objects with constructors **/
  it('Should handle a Map', () => {
    const error = createInvalidObservableTypeError(new Map());
    expect(error.message).to.match(/^You provided an invalid object where a stream was expected./);
  });
  it('Should handle a Set', () => {
    const error = createInvalidObservableTypeError(new Set());
    expect(error.message).to.match(/^You provided an invalid object where a stream was expected./);
  });
  it('Should handle an Error', () => {
    const error = createInvalidObservableTypeError(new Error());
    expect(error.message).to.match(/^You provided an invalid object where a stream was expected./);
  });
  it('Should handle a TypeError', () => {
    const error = createInvalidObservableTypeError(new TypeError());
    expect(error.message).to.match(/^You provided an invalid object where a stream was expected./);
  });
  it('Should handle a Proxy', () => {
    const error = createInvalidObservableTypeError(new Proxy(new Map(), {}));
    expect(error.message).to.match(/^You provided an invalid object where a stream was expected./);
  });
  it('Should handle an Observable', () => {
    const error = createInvalidObservableTypeError(from<string>('FooBar'));
    expect(error.message).to.match(/^You provided an invalid object where a stream was expected./);
  });

  /** everything else **/
  it('Should handle undefined', () => {
    const error = createInvalidObservableTypeError(undefined);
    expect(error.message).to.match(/^You provided 'undefined' where a stream was expected./);
  });
});
