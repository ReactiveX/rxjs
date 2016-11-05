"use strict";
var chai_1 = require('chai');
var Set_1 = require('../../dist/cjs/util/Set');
describe('Set', function () {
    if (typeof Set === 'function') {
        it('should use Set if Set exists', function () {
            chai_1.expect(Set_1.Set).to.equal(Set);
        });
    }
});
describe('minimalSetImpl()', function () {
    it('should provide the minimal Set we require', function () {
        var MinSet = Set_1.minimalSetImpl();
        var test = new MinSet();
        chai_1.expect(MinSet.prototype.add).to.be.a('function');
        chai_1.expect(MinSet.prototype.has).to.be.a('function');
        chai_1.expect(MinSet.prototype.clear).to.be.a('function');
        chai_1.expect(test.size).to.be.a('number');
    });
    describe('returned MinimalSet', function () {
        it('should implement add, has, size and clear', function () {
            var MinSet = Set_1.minimalSetImpl();
            var test = new MinSet();
            chai_1.expect(test.size).to.equal(0);
            test.add('Laverne');
            chai_1.expect(test.size).to.equal(1);
            chai_1.expect(test.has('Laverne')).to.be.true;
            chai_1.expect(test.has('Shirley')).to.be.false;
            test.add('Shirley');
            chai_1.expect(test.size).to.equal(2);
            chai_1.expect(test.has('Laverne')).to.be.true;
            chai_1.expect(test.has('Shirley')).to.be.true;
            var squiggy = { name: 'Andrew Squiggman' };
            var identicalSquiggy = { name: 'Andrew Squiggman' }; // lol, imposter!
            test.add(squiggy);
            chai_1.expect(test.size).to.equal(3);
            chai_1.expect(test.has(identicalSquiggy)).to.be.false;
            chai_1.expect(test.has(squiggy)).to.be.true;
            test.clear();
            chai_1.expect(test.size).to.equal(0);
            chai_1.expect(test.has('Laverne')).to.be.false;
            chai_1.expect(test.has('Shirley')).to.be.false;
            chai_1.expect(test.has(squiggy)).to.be.false;
            chai_1.expect(test.has(identicalSquiggy)).to.be.false;
            test.add('Fonzi');
            chai_1.expect(test.size).to.equal(1);
            chai_1.expect(test.has('Fonzi')).to.be.true;
        });
    });
});
//# sourceMappingURL=Set-spec.js.map