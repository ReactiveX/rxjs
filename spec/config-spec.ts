import { config } from '../src/internal/config';
import { expect } from 'chai';

describe('config', () => {
  it('should have a Promise property that defaults to nothing', () => {
    expect(config).to.have.property('Promise');
    expect(config.Promise).to.be.undefined;
  });
});