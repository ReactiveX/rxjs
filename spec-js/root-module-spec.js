"use strict";
var Rx = require('../dist/cjs/Rx');
describe('Root Module', function () {
    it('should contain exports from commonjs modules', function () {
        expect(typeof Rx.Observable).toBe('function');
    });
});
//# sourceMappingURL=root-module-spec.js.map