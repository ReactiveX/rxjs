"use strict";
var root_1 = require('../../dist/cjs/util/root');
var iterator_1 = require('../../dist/cjs/symbol/iterator');
describe('rxSubscriber symbol', function () {
    it('should exist in the proper form', function () {
        var Symbol = root_1.root.Symbol;
        if (typeof Symbol === 'function') {
            if (Symbol.iterator) {
                expect(iterator_1.$$iterator).toBe(Symbol.iterator);
            }
            else if (root_1.root.Set && typeof (new root_1.root.Set()['@@iterator']) === 'function') {
                // FF bug coverage
                expect(iterator_1.$$iterator).toBe('@@iterator');
            }
            else if (root_1.root.Map) {
                // es6-shim specific logic
                var keys = Object.getOwnPropertyNames(root_1.root.Map.prototype);
                for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    if (key !== 'entries' && key !== 'size' && root_1.root.Map.prototype[key] === root_1.root.Map.prototype['entries']) {
                        expect(iterator_1.$$iterator).toBe(key);
                        break;
                    }
                }
            }
            else if (typeof Symbol.for === 'function') {
                expect(iterator_1.$$iterator).toBe(Symbol.for('iterator'));
            }
        }
        else {
            expect(iterator_1.$$iterator).toBe('@@iterator');
        }
    });
});
//# sourceMappingURL=iterator-spec.js.map