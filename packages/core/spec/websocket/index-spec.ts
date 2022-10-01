import * as index from 'rxjs/webSocket';
import { expect } from 'chai';

describe('index', () => {
  it('should export static websocket subject creator functions', () => {
    expect(index.webSocket).to.exist;
  });
});
