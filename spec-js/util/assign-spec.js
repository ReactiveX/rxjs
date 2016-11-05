"use strict";
var chai_1 = require('chai');
var assign_1 = require('../../dist/cjs/util/assign');
describe('assign', function () {
    it('should exist', function () {
        chai_1.expect(assign_1.assign).to.be.a('function');
    });
    if (Object.assign) {
        it('should use Object.assign if available', function () {
            chai_1.expect(assign_1.assign).to.equal(Object.assign);
        });
    }
    it('should assign n objects to a target', function () {
        var target = { what: 'what' };
        var source1 = { wut: 'socks' };
        var source2 = { and: 'sandals' };
        var result = assign_1.assign(target, source1, source2);
        chai_1.expect(result).to.equal(target);
        chai_1.expect(result).to.deep.equal({ what: 'what', wut: 'socks', and: 'sandals' });
    });
});
describe('assignImpl', function () {
    it('should assign n objects to a target', function () {
        var target = { what: 'what' };
        var source1 = { wut: 'socks' };
        var source2 = { and: 'sandals' };
        var result = assign_1.assignImpl(target, source1, source2);
        chai_1.expect(result).to.equal(target);
        chai_1.expect(result).to.deep.equal({ what: 'what', wut: 'socks', and: 'sandals' });
    });
});
describe('getAssign', function () {
    it('should return assignImpl if Object.assign does not exist on root', function () {
        var result = assign_1.getAssign({ Object: {} });
        chai_1.expect(result).to.equal(assign_1.assignImpl);
    });
    it('should return Object.assign if it exists', function () {
        var FAKE = function () { };
        var result = assign_1.getAssign({ Object: { assign: FAKE } });
        chai_1.expect(result).to.equal(FAKE);
    });
});
//# sourceMappingURL=assign-spec.js.map