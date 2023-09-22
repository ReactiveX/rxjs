/** @prettier */
import { expect } from 'chai';
import { EMPTY } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {empty} */
describe('empty', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should only complete', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const expected = '|';
      expectObservable(EMPTY).toBe(expected);
    });
  });

  it('should be synchronous', () => {
    let hit = false;
    EMPTY.subscribe({
      complete() {
        hit = true;
      },
    });
    expect(hit).to.be.true;
  });
});
