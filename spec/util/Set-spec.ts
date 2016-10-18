import {expect} from 'chai';
import { Set as TestSet, minimalSetImpl } from '../../dist/cjs/util/Set';

describe('Set', () => {
  if (typeof Set === 'function') {
    it('should use Set if Set exists', () => {
      expect(TestSet).to.equal(Set);
    });
  }
});

describe('minimalSetImpl()', () => {
  it('should provide the minimal Set we require', () => {
    const MinSet = minimalSetImpl();
    const test = new MinSet();

    expect(MinSet.prototype.add).to.be.a('function');
    expect(MinSet.prototype.has).to.be.a('function');
    expect(MinSet.prototype.clear).to.be.a('function');
    expect(test.size).to.be.a('number');
  });

  describe('returned MinimalSet', () => {
    it('should implement add, has, size and clear', () => {
      const MinSet = minimalSetImpl();
      const test = new MinSet();

      expect(test.size).to.equal(0);

      test.add('Laverne');
      expect(test.size).to.equal(1);
      expect(test.has('Laverne')).to.be.true;
      expect(test.has('Shirley')).to.be.false;

      test.add('Shirley');
      expect(test.size).to.equal(2);
      expect(test.has('Laverne')).to.be.true;
      expect(test.has('Shirley')).to.be.true;

      const squiggy = { name: 'Andrew Squiggman' };
      const identicalSquiggy = { name: 'Andrew Squiggman' }; // lol, imposter!

      test.add(squiggy);
      expect(test.size).to.equal(3);
      expect(test.has(identicalSquiggy)).to.be.false;
      expect(test.has(squiggy)).to.be.true;

      test.clear();
      expect(test.size).to.equal(0);
      expect(test.has('Laverne')).to.be.false;
      expect(test.has('Shirley')).to.be.false;
      expect(test.has(squiggy)).to.be.false;
      expect(test.has(identicalSquiggy)).to.be.false;

      test.add('Fonzi');
      expect(test.size).to.equal(1);
      expect(test.has('Fonzi')).to.be.true;
    });
  });
});