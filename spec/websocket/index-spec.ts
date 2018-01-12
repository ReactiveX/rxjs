import * as index from '../../src/websocket/index';
import { expect } from 'chai';

describe('index', () => {
  it('should export static websocket subject creator functions', () => {
    expect(index.websocket).to.exist;
  });
});
