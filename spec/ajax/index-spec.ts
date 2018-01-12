import * as index from '../../src/ajax/index';
import { expect } from 'chai';

describe('index', () => {
  it('should export static ajax observable creator functions', () => {
    expect(index.ajax).to.exist;
  });
});
