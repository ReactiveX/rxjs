import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports
import { empty } from '../../src/create';
import { EMPTY } from '../../src';
import { expect } from 'chai';

declare const asDiagram: any;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const rxTestScheduler: any;

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
