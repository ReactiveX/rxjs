import * as index from '../../src/testing/index';
import { expect } from 'chai';

describe('index', () => {
  it('should export TestScheduler', () => {
    expect(index.TestScheduler).to.exist;
  });
});
