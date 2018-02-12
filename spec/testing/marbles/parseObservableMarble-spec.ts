import { expect } from 'chai';
import { ColdObservable } from '../../../src/internal/testing/ColdObservable';
import { parseObservableMarble } from '../../../src/internal/testing/marbles/parseObservableMarble';
import { complete, error, next } from '../../../src/internal/testing/message/TestMessage';
//import { TestScheduler } from '../../src/scheduler/TestScheduler';

describe('parseObservableMarble', () => {
  it('should not allow unsubscription token', () => {
    const marble = '----!';

    expect(() => parseObservableMarble(marble)).to.throw();
  });

  it('should parse timeframe without value', () => {
    const marble = '------';

    const messages = parseObservableMarble(marble);
    expect(messages).to.be.empty;
  });

  it('should parse timeframe with value', () => {
    const marble = '-------a';

    const messages = parseObservableMarble(marble);
    const expected = [next(7, 'a')];

    expect(messages).to.deep.equal(expected);
  });

  it('should correctly parse falsy timeframe value', () => {
    const marble = '--a-b-c-d';

    const messages = parseObservableMarble(marble, { a: null, b: false, c: 0, d: undefined });
    const expected = [next(2, null), next(4, false), next(6, 0), next(8, 'd')];

    expect(messages).to.deep.equal(expected);
  });

  it('should parse timeframe with maxFrame', () => {
    const marble = '--a------b--|';

    const messages = parseObservableMarble(marble, null, null, false, 1, 5);
    const expected = [next(2, 'a')];

    expect(messages).to.deep.equal(expected);
  });

  it('should flatten custom value with inner observable when specified', () => {
    const marble = '----a--b--';
    const aMessages = [next(1, '1'), next(2, '2')];
    const bMessages = [next(3, '3'), next(4, '4')];

    const customValue = {
      a: new ColdObservable(aMessages, null as any),
      b: new ColdObservable(bMessages, null as any)
    };

    const messages = parseObservableMarble(marble, customValue, null, true);
    const expected = [next(4, aMessages), next(7, bMessages)];

    expect(messages).to.deep.equal(expected);
  });

  it('should not flatten custom value with inner observable when not specified', () => {
    const marble = '----a--b--';
    const aMessages = [next(1, '1'), next(2, '2')];
    const bMessages = [next(3, '3'), next(4, '4')];

    const customValue = {
      a: new ColdObservable<string>(aMessages, null as any),
      b: new ColdObservable<string>(bMessages, null as any)
    };

    const messages = parseObservableMarble(marble, customValue, null, false);
    const expected = [next(4, customValue.a), next(7, customValue.b)];

    expect(messages).to.deep.equal(expected);
  });

  it('should support custom timeframe value', () => {
    const marble = '-------a----';

    const messages = parseObservableMarble(marble, null, null, false, 10);
    const expected = [next(70, 'a')];

    expect(messages).to.deep.equal(expected);
  });

  it('should support custom timeframe value with maxFrame', () => {
    const marble = '--a------b--|';

    const messages = parseObservableMarble(marble, null, null, false, 10, 50);
    const expected = [next(20, 'a')];

    expect(messages).to.deep.equal(expected);
  });

  it('should parse value literal', () => {
    const marble = 'x';

    const messages = parseObservableMarble(marble);
    const expected = [next(0, marble)];

    expect(messages[0]).to.deep.equal(expected[0]);
  });

  it('should parse value literal with custom value', () => {
    const marble = '----a----';
    const customValue = {
      a: 'qwerty'
    };

    const messages = parseObservableMarble(marble, customValue);
    const expected = [next(4, customValue.a)];

    expect(messages).to.deep.equal(expected);
  });

  it('should allow whitespace', () => {
    const marble = '----    ----a';

    const messages = parseObservableMarble(marble);
    const expected = [next(8, 'a')];

    expect(messages).to.deep.equal(expected);
  });

  it('should allow expanding timeframe', () => {
    const marble = '----...14...----a----';

    const messages = parseObservableMarble(marble);
    const expected = [next(22, 'a')];

    expect(messages).to.deep.equal(expected);
  });

  it('should throw if expanding timeframe does not contain values', () => {
    const marble = '----......----a----';

    expect(() => parseObservableMarble(marble)).to.throw();
  });

  it('should throw when try to set timeframe in expanding timeframe', () => {
    const marble = '-------...-14...-';

    expect(() => parseObservableMarble(marble)).to.throw();
  });

  it('should parse simultaneous value', () => {
    //             '-------v   ----v'
    const marble = '-------(ab)----(c|)';

    const messages = parseObservableMarble(marble);
    const expected = [next(7, 'a'), next(7, 'b'), next(12, 'c'), complete(12)];

    expect(messages).to.deep.equal(expected);
  });

  it('should throw when try to nest simultaneous value', () => {
    const marble = '-----(a(b|))';

    expect(() => parseObservableMarble(marble)).to.throw();
  });

  it('should throw when try to set timeframe in simultaneous value', () => {
    const marble = '-------(a-b)';

    expect(() => parseObservableMarble(marble)).to.throw();
  });

  it('should parse complete', () => {
    const marble = '---a---|';

    const messages = parseObservableMarble(marble);
    const expected = [next(3, 'a'), complete(7)];

    expect(messages).to.deep.equal(expected);
  });

  it('should parse error', () => {
    const marble = '----#';

    const messages = parseObservableMarble(marble);
    const expected = [error(4)];

    expect(messages).to.deep.equal(expected);
  });

  it('should parse error with custom value', () => {
    const marble = '----#---';
    const e = 'meh';

    const messages = parseObservableMarble(marble, null, e);
    const expected = [error(4, e)];

    expect(messages).to.deep.equal(expected);
  });

  it('should support subscription offset for hot observable', () => {
    const marble = '----^----a----';
    //             '     ----a----';
    const messages = parseObservableMarble(marble);
    const expected = [next(5, 'a')];

    expect(messages).to.deep.equal(expected);
  });

  /* TODO: enable once migrate new testscheduler
  it('should able to flatten inner observable', () => {
    const scheduler = new TestScheduler(false, 1, 1000);

    const marble = '                            --a--|';
    const inner = scheduler.createColdObservable('---1--');

    const messages = parseObservableMarble(marble, { a: inner }, null, true);
    const expected = [next(2, [next(3, '1')]), complete(5)];

    expect(messages).to.deep.equal(expected);
  });*/
});
