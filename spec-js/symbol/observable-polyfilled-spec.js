"use strict";
var chai_1 = require('chai');
var observable_1 = require('../../dist/cjs/symbol/observable');
describe('observable symbol', function () {
    it('should exist in the proper form when Symbol does not exist', function () {
        var $$observable = observable_1.getSymbolObservable({ Symbol: undefined });
        chai_1.expect($$observable).to.equal('@@observable');
    });
});
//# sourceMappingURL=observable-polyfilled-spec.js.map