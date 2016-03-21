"use strict";
var root_1 = require('../../dist/cjs/util/root');
var observable_1 = require('../../dist/cjs/symbol/observable');
describe('rxSubscriber symbol', function () {
    it('should exist in the proper form', function () {
        var Symbol = root_1.root.Symbol;
        if (typeof Symbol === 'function') {
            expect(Symbol.observable).toBeDefined();
            expect(observable_1.$$observable).toBe(Symbol.observable);
        }
        else {
            expect(observable_1.$$observable).toBe('@@observable');
        }
    });
});
//# sourceMappingURL=observable-spec.js.map