import { expect } from 'chai';
import { assign, getAssign, assignImpl } from '../../dist/package/util/assign';

describe('assign', () => {
  it('should exist', () => {
    expect(assign).to.be.a('function');
  });

  if (Object.assign) {
    it('should use Object.assign if available', () => {
      expect(assign).to.equal(Object.assign);
    });
  }

  it('should assign n objects to a target', () => {
    const target = { what: 'what' };
    const source1 = { wut: 'socks' };
    const source2 = { and : 'sandals' };
    const result = assign(target, source1, source2);

    expect(result).to.equal(target);
    expect(result).to.deep.equal({ what: 'what', wut: 'socks', and: 'sandals' });
  });
});

describe('assignImpl', () => {
  it('should assign n objects to a target', () => {
    const target = { what: 'what' };
    const source1 = { wut: 'socks' };
    const source2 = { and : 'sandals' };
    const result = assignImpl(target, source1, source2);

    expect(result).to.equal(target);
    expect(result).to.deep.equal({ what: 'what', wut: 'socks', and: 'sandals' });
  });
});

describe('getAssign', () => {
  it('should return assignImpl if Object.assign does not exist on root', () => {
    const result = getAssign({ Object: {} });
    expect(result).to.equal(assignImpl);
  });

  it('should return Object.assign if it exists', () => {
    const FAKE = () => { /* lol */ };
    const result = getAssign({ Object: { assign: FAKE } });
    expect(result).to.equal(FAKE);
  });
});