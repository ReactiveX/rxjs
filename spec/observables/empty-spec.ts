/** @prettier */
import { expect } from 'chai';
import { empty, EMPTY } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {empty} */
describe('empty', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should return EMPTY', () => {
    expect(empty()).to.equal(EMPTY);
  });

  it('should create a cold observable with only complete', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const expected = '|';
      const e1 = empty();
      expectObservable(e1).toBe(expected);
    });
  });

  it('should return the same instance EMPTY', () => {
    const s1 = empty();
    const s2 = empty();
    expect(s1).to.equal(s2);
  });

  it('should be synchronous by default', () => {
    const source = empty();
    let hit = false;
    source.subscribe({
      complete() {
        hit = true;
      },
    });
    expect(hit).to.be.true;
  });

  it('should equal EMPTY', () => {
    expect(empty()).to.equal(EMPTY);
  });

  it('should take a scheduler', () => {
    const source = empty(rxTestScheduler);
    let hit = false;
    source.subscribe({
      complete() {
        hit = true;
      },
    });
    expect(hit).to.be.false;
    rxTestScheduler.flush();
    expect(hit).to.be.true;
  });
});
