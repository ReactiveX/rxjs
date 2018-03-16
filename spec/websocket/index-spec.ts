import * as index from 'rxjs/websocket';
import { expect } from 'chai';

describe('index', () => {
  it('should export static websocket subject creator functions', () => {
    expect(index.websocket).to.exist;
  });
});
