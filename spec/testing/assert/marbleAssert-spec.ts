import { expect } from 'chai';
import { marbleAssert } from '../../../src/internal/testing/assert/marbleAssert';
import { parseObservableMarble as p } from '../../../src/internal/testing/marbles/parseObservableMarble';
import { subscribe } from '../../../src/internal/testing/message/TestMessage';

describe('marbleAssert', () => {
  it('should throw if source is neither array nor SubscriptionLog', () => {
    expect(() => marbleAssert(1 as any)).to.throw();
  });

  describe('TestMessage', () => {
    it('shoud pass empty', () => {
      marbleAssert(p('------')).to.equal(p('------'));
      marbleAssert([]).to.equal(p('------'));
      marbleAssert([]).to.equal([]);
    });

    it('should pass observables', () => {
      const s = p('--a--b--');
      const e = p('--a--b--');

      expect(() => marbleAssert(s).to.equal(e)).to.not.throw();
    });

    it('should pass observable with noop', () => {
      const s = p('--a-  -b--');
      const e = p('--a- -b--');

      expect(() => marbleAssert(s).to.equal(e)).to.not.throw();
    });

    it('should pass observable with groups', () => {
      const s = p('--(ab)-c-');
      const e = p('--(ab)-c--');

      expect(() => marbleAssert(s).to.equal(e)).to.not.throw();
    });

    it('should pass observable with expand', () => {
      const s = p('--a-...3...-b--');
      const e = p('--a-----b--');

      expect(() => marbleAssert(s).to.equal(e)).to.not.throw();
    });

    it('should pass observable with complete', () => {
      const s = p('a--b--|');
      const e = p('a--b--|');

      expect(() => marbleAssert(s).to.equal(e)).to.not.throw();
    });

    it('should pass observable with synchronous group', () => {
      const s = p('(a|)');
      const e = p('(a|)');

      expect(() => marbleAssert(s).to.equal(e)).to.not.throw();
    });

    it('should pass observable with error', () => {
      const s = p('--a--b--#');
      const e = p('--a--b--#');

      expect(() => marbleAssert(s).to.equal(e)).to.not.throw();
    });

    it('should pass observable with custom value', () => {
      const s = p('--a--b--', { a: 1 });
      const e = p('--a--b--', { a: 1 });

      expect(() => marbleAssert(s).to.equal(e)).to.not.throw();
    });

    it('should pass observable with custom error', () => {
      const s = p('--a--b--#', null, 1);
      const e = p('--a--b--#', null, 1);

      expect(() => marbleAssert(s).to.equal(e)).to.not.throw();
    });

    it('should pass hot observable with subscription, without emit before sub', () => {
      const s = p('^--a--b--');
      const e = p('---a--b--');

      expect(() => marbleAssert(s).to.equal(e)).to.not.throw();
    });

    it('should pass hot observable with subscription, emit before sub', () => {
      const s = p('-x--^--a--b--');
      const e = p('-x--^--a--b--');

      expect(() => marbleAssert(s).to.equal(e)).to.not.throw();
    });

    it('should assert empty source', () => {
      expect(() => marbleAssert([]).to.equal(p('----s'))).to.throw();
    });

    it('should assert non-array expected', () => {
      expect(() => marbleAssert([]).to.equal('1' as any)).to.throw();
    });

    it('should assert observables frame', () => {
      const s = p('--a--b--');
      const e = p('--a---b--');

      expect(() => marbleAssert(s).to.equal(e)).to.throw();
    });

    it('should assert observables value', () => {
      const s = p('--a--b--');
      const e = p('--a--x--');

      expect(() => marbleAssert(s).to.equal(e)).to.throw();
    });

    it('should assert observables with noop', () => {
      const s = p('--a-  -b--');
      const e = p('--a- --b--');

      expect(() => marbleAssert(s).to.equal(e)).to.throw();
    });

    it('should assert observables with groups', () => {
      const s = p('--a--b--(c|)');
      const e = p('--a--b--(cd|)');

      expect(() => marbleAssert(s).to.equal(e)).to.throw();
    });

    it('should assert observables with expand', () => {
      const s = p('--a-...3...-b--');
      const e = p('--a-...4...-b--');

      expect(() => marbleAssert(s).to.equal(e)).to.throw();
    });

    it('should assert observables with complete', () => {
      const s = p('--a--b--|');
      const e = p('--a--b--');

      expect(() => marbleAssert(s).to.equal(e)).to.throw();
    });

    it('should assert observables with synchronous group', () => {
      const s = p('(ab|)');
      const e = p('(a|)');

      expect(() => marbleAssert(s).to.equal(e)).to.throw();
    });

    it('should assert observables with error', () => {
      const s = p('--a--b--#');
      const e = p('--a--b--');

      expect(() => marbleAssert(s).to.equal(e)).to.throw();
    });

    it('should assert observables with custom value', () => {
      const s = p('--a--b--', { a: 'meh' });
      const e = p('--a--b--');

      expect(() => marbleAssert(s).to.equal(e)).to.throw();
    });

    it('should assert observables with custom error', () => {
      const s = p('--a--b--#', null, 'meh');
      const e = p('--a--b--#');

      expect(() => marbleAssert(s).to.equal(e)).to.throw();
    });

    it('should assert hot observable with subscriptions, without emit before sub', () => {
      const s = p('^--a--b--');
      const e = p('--a--b--');

      expect(() => marbleAssert(s).to.equal(e)).to.throw();
    });

    it('should assert hot observable with subscription, emit before sub', () => {
      const s = p('-x--^--a--b--');
      const e = p('---y^--a--b--');

      expect(() => marbleAssert(s).to.equal(e)).to.throw();
    });
  });

  describe('SubscriptionLog', () => {
    it('should pass if subscription matches', () => {
      const source = [subscribe(10)];

      expect(() => marbleAssert(source).to.equal(source)).to.not.throw();
    });

    it('should pass if subscription with unsubscription matches', () => {
      const source = [subscribe(10, 45)];

      expect(() => marbleAssert(source).to.equal(source)).to.not.throw();
    });

    it('should pass if unsubscription matches', () => {
      const source = [subscribe(Number.POSITIVE_INFINITY, 20)];

      expect(() => marbleAssert(source).to.equal(source)).to.not.throw();
    });

    it('should pass if subscription is empty', () => {
      const source = [subscribe(Number.POSITIVE_INFINITY)];

      expect(() => marbleAssert(source).to.equal(source)).to.not.throw();
    });

    it('should pass multiple subscriptions', () => {
      const source = [subscribe(10, 45), subscribe(20, 35)];

      expect(() => marbleAssert(source).to.equal(source)).to.not.throw();
    });

    it('should assert empty source', () => {
      expect(() => marbleAssert([]).to.equal([subscribe(10, 24)] as any)).to.throw();
    });

    it('should assert non-array expected', () => {
      expect(() => marbleAssert([]).to.equal('1' as any)).to.throw();
    });

    it('should assert if subscription unmatches', () => {
      const source = [subscribe(10)];
      const expected = [subscribe(20)];

      expect(() => marbleAssert(source).to.equal(expected)).to.throw();
    });

    it('should assert if subscription with unsubscription unmatches', () => {
      const source = [subscribe(10, 45)];
      const expected = [subscribe(12, 46)];

      expect(() => marbleAssert(source).to.equal(expected)).to.throw();
    });

    it('should assert if subscription unmatches with unsubscription', () => {
      const source = [subscribe(10, 45)];
      const expected = [subscribe(12, 45)];

      expect(() => marbleAssert(source).to.equal(expected)).to.throw();
    });

    it('should assert if unsubscription with subscription unmatches', () => {
      const source = [subscribe(10, 45)];
      const expected = [subscribe(10, 46)];

      expect(() => marbleAssert(source).to.equal(expected)).to.throw();
    });

    it('should assert if unsubscription unmatches', () => {
      const source = [subscribe(Number.POSITIVE_INFINITY, 20)];
      const expected = [subscribe(Number.POSITIVE_INFINITY, 30)];

      expect(() => marbleAssert(source).to.equal(expected)).to.throw();
    });

    it('should assert same length multiple subscription', () => {
      const source = [subscribe(10, 45), subscribe(5, 35), subscribe(10, 46)];
      const expected = [subscribe(10, 46), subscribe(5, 35), subscribe(10, 45)];

      expect(() => marbleAssert(source).to.equal(expected)).to.throw();
    });

    it('should assert larger source multiple subscription', () => {
      const source = [subscribe(10, 45), subscribe(5, 35), subscribe(10, 46), subscribe(6, 35)];
      const expected = [subscribe(10, 46), subscribe(5, 35), subscribe(10, 45)];

      expect(() => marbleAssert(source).to.equal(expected)).to.throw();
    });

    it('should assert larger expected multiple subscription', () => {
      const source = [subscribe(10, 45), subscribe(5, 35), subscribe(10, 46)];
      const expected = [subscribe(10, 46), subscribe(5, 35), subscribe(10, 45), subscribe(6, 35)];

      expect(() => marbleAssert(source).to.equal(expected)).to.throw();
    });
  });
});
