import { expect } from '../__fixtures__/testHelper';
import { createError, enhanceError } from 'rxjs/internal/observable/unstableAjax/utils/createError';

describe('createError', () => {
  it('should create an Error with message, config, code, request, response', () => {
    const request = { path: '/foo' };
    const response = { status: 200, data: { foo: 'bar' } };
    const error = createError('Boom!', { foo: 'bar' }, 'ESOMETHING', request, response);

    expect(error).to.be.instanceof(Error);
    expect(error).to.containSubset({
      message: 'Boom!',
      config: { foo: 'bar' },
      code: 'ESOMETHING',
      request,
      response
    });
  });

  it('should create an Error that can be serialized to JSON', () => {
    // Attempting to serialize request and response results in
    //    TypeError: Converting circular structure to JSON
    const request = { path: '/foo' };
    const response = { status: 200, data: { foo: 'bar' } };
    const error = createError('Boom!', { foo: 'bar' }, 'ESOMETHING', request, response);
    const json = error.toJSON();

    expect(json).to.containSubset({
      message: 'Boom!',
      config: { foo: 'bar' },
      code: 'ESOMETHING'
    });
  });
});

describe('enhanceError', () => {
  it('should add config, config, request and response to error', () => {
    const originalError = new Error('Boom!');
    const request = { path: '/foo' };
    const response = { status: 200, data: { foo: 'bar' } };

    const error = enhanceError(originalError, { foo: 'bar' }, 'ESOMETHING', request, response);
    expect(error).to.containSubset({
      message: 'Boom!',
      config: { foo: 'bar' },
      code: 'ESOMETHING',
      request,
      response
    });
  });

  it('should return error', () => {
    const err = new Error('Boom!');
    expect(enhanceError(err, { foo: 'bar' }, 'ESOMETHING')).to.equal(err);
  });
});
