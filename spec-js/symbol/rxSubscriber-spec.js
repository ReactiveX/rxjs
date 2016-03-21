"use strict";
var root_1 = require('../../dist/cjs/util/root');
var rxSubscriber_1 = require('../../dist/cjs/symbol/rxSubscriber');
describe('rxSubscriber symbol', function () {
    it('should exist in the proper form', function () {
        if (root_1.root.Symbol && root_1.root.Symbol.for) {
            expect(rxSubscriber_1.$$rxSubscriber).toEqual(root_1.root.Symbol.for('rxSubscriber'));
        }
        else {
            expect(rxSubscriber_1.$$rxSubscriber).toEqual('@@rxSubscriber');
        }
    });
});
//# sourceMappingURL=rxSubscriber-spec.js.map