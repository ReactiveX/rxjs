import { expect } from 'chai';
import { expectObservable } from '../helpers/marble-testing';
import { empty, EMPTY } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

declare const asDiagram: any;
declare const rxTestScheduler: TestScheduler;

/** @test {empty} */
describe('empty', () => {
  asDiagram('empty')('should create a cold observable with only complete', () => {
    const expected = '|';
    const e1 = empty();
    expectObservable(e1).toBe(expected);
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
      complete() { hit = true; }
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
      complete() { hit = true; }
    });
    expect(hit).to.be.false;
    rxTestScheduler.flush();
    expect(hit).to.be.true;
  });
});
