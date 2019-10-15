import { expect } from 'chai';
import { defaultOptions } from 'rxjs/ajax';

describe('defaultOptions', () => {
  it('should transform request json', () => {
    expect(defaultOptions.transformRequest![0]({ foo: 'bar' }, null as any)).to.equal('{"foo":"bar"}');
  });

  it('should do nothing to request string', () => {
    expect(defaultOptions.transformRequest![0]('foo=bar', null as any)).to.equal('foo=bar');
  });

  it('should transform response json', () => {
    const data = defaultOptions.transformResponse![0]('{"foo":"bar"}');

    expect(typeof data).to.equal('object');
    expect(data.foo).to.equal('bar');
  });

  it('should do nothing to response string', () => {
    expect(defaultOptions.transformResponse![0]('foo=bar')).to.equal('foo=bar');
  });
});
