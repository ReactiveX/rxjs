import { expect } from "chai";
import { race } from "rxjs/internal/create/race";

// TODO: add zones.js based tests for this

describe('race', () => {
  it('should exist', () => {
    expect(race).to.be.a('function');
  });
});
