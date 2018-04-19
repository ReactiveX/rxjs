import { expect } from 'chai';
import { constructObservableMarble } from '../../../src/internal/testing/assert/constructObservableMarble';
import { parseObservableMarble as p } from '../../../src/internal/testing/marbles/parseObservableMarble';
//import { TestScheduler } from '../../src/scheduler/TestScheduler';

describe('constructObservableMarble', () => {
  it('should create empty marble', () => {
    const s = '---------';
    const e = '------------------------------';

    const source = p(s);
    const marble = constructObservableMarble(source);

    expect(marble).to.equal(e);
  });

  it('should create marble', () => {
    const s = '-----a----';
    const e = '-----a-----';

    const source = p(s);
    const marble = constructObservableMarble(source);

    expect(marble).to.equal(e);
  });

  it('should support custom value', () => {
    const custom = {
      a: 1,
      b: { x: 'meh' },
      d: 4,
      f: ['value']
    };

    const s = '--a--b--c--d--e--f--|';
    const e = '--1--ä--c--4--e--ḅ--|';

    const source = p(s, custom);
    const marble = constructObservableMarble(source);

    expect(marble).to.equal(e);
  });

  it('should create marble with custom timeframe out of range', () => {
    const s = '-----a--b--|';
    const e = '-...48...-a-...28...-b-...28...-|';

    const source = p(s, null, null, false, 10);
    const marble = constructObservableMarble(source);

    expect(marble).to.equal(e);
  });

  it('should create marble start off immediately', () => {
    const s = 'a----';
    const e = 'a-----';

    const source = p(s);
    const marble = constructObservableMarble(source);

    expect(marble).to.equal(e);
  });

  it('should create marble with completion', () => {
    const s = '-----a--b--|';
    const e = '-----a--b--|';

    const source = p(s);
    const marble = constructObservableMarble(source);

    expect(marble).to.equal(e);
  });

  it('should create marble with error', () => {
    const s = '-----a--x-----#';
    const e = '-----a--x-----#';

    const source = p(s);
    const marble = constructObservableMarble(source);

    expect(marble).to.equal(e);
  });

  it('should create marble with custom error', () => {
    const s = '-----a--x-----#';
    const e = '-----a--x-----#';

    const source = p(s, null, 'meh');
    const marble = constructObservableMarble(source);

    expect(marble).to.equal(e);
  });

  it('should create marble with noop', () => {
    const s = '---   --a-  -b--  |';
    const e = '-----a--b--|';

    const source = p(s);
    const marble = constructObservableMarble(source);

    expect(marble).to.equal(e);
  });

  it('should create marble with grouped value', () => {
    const s = '-----a--(bc)--(def|)';
    const e = '-----a--(bc)--(def|)';

    const source = p(s);
    const marble = constructObservableMarble(source);

    expect(marble).to.equal(e);
  });

  it('should create marble with synchronous grouped', () => {
    const s = '(ab|)';
    const e = '(ab|)';

    const source = p(s);
    const marble = constructObservableMarble(source);

    expect(marble).to.equal(e);
  });

  it('should create marble with grouped value with noop', () => {
    const s = '---   --a--(bc) -  -(def|)';
    const e = '-----a--(bc)--(def|)';

    const source = p(s);
    const marble = constructObservableMarble(source);

    expect(marble).to.equal(e);
  });

  it('should create marble with subscription, without minus emit', () => {
    const s = '------^--a--b--|';
    const e = '---a--b--|';

    const source = p(s);
    const marble = constructObservableMarble(source);

    expect(marble).to.equal(e);
  });

  it('should create marble with subscription, with minus emit', () => {
    //          -6 -3  0  3  6  9
    const s = '--x--y--^--a--b--|';
    //         0  3  6  9  12 15
    const e = 'x--y--^--a--b--|';

    const source = p(s);
    const marble = constructObservableMarble(source);

    expect(marble).to.equal(e);
  });

  /* TODO: enable once migrate new testscheduler
  it('should create marble with higher order obsrevables', () => {
    const scheduler = new TestScheduler(false, 1, 1000);

    const s = '--a--b--|';
    const a = scheduler.createHotObservable('--1--2--|');
    const b = scheduler.createHotObservable('--3--4--|');
    const e = '--ä--ḅ--|';

    const source = p(s, { a, b }, null, true);
    const marble = constructObservableMarble(source);

    expect(marble).to.equal(e);
  });*/
});
