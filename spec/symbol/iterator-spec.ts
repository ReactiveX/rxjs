import { expect } from 'chai';
import { $$iterator, symbolIteratorPolyfill } from '../../dist/cjs/symbol/iterator';

describe('iterator symbol', () => {
  it('should exist', () => {
    expect($$iterator).to.exist;
  });
});

describe('symbolIteratorPolyfill', () => {
  describe('when root.Symbol is a function', () => {
    describe('and Symbol.iterator exists', () => {
      it('should return Symbol.iterator', () => {
        const FakeSymbol = function () { /* lol */ };
        (<any>FakeSymbol).iterator = {};
        const result = symbolIteratorPolyfill({ Symbol: FakeSymbol });
        expect(result).to.equal((<any>FakeSymbol).iterator);
      });
    });

    describe('and Symbol.iterator does not exist', () => {
      it('should use Symbol to create an return a symbol and polyfill Symbol.iterator', () => {
        const SYMBOL_RETURN = {};
        let passedDescription: string;
        const root = {
          Symbol: function (description) {
            passedDescription = description;
            return SYMBOL_RETURN;
          }
        };

        const result = symbolIteratorPolyfill(root);
        expect(result).to.equal(SYMBOL_RETURN);
        expect((<any>root.Symbol).iterator).to.equal(SYMBOL_RETURN);
      });
    });
  });

  describe('when root.Symbol is NOT a function', () => {
    describe('and root.Set exists with an @@iterator property that is a function (Mozilla bug)', () => {
      it ('should return "$$iterator"', () => {
        const result = symbolIteratorPolyfill({
          Set: function FakeSet() {
            this['@@iterator'] = function () { /* lol */ };
          }
        });
        expect(result).to.equal('@@iterator');
      });
    });

    describe('root.Set does not exit or does not have an @@iterator property', () => {
      describe('but Map exists and a random key on Map.prototype that matches Map.prototype.entries (for es6-shim)', () => {
        it('should return the key that matches the "entries" key on Map.prototype, but not return "size"', () => {
          function FakeMap() { /* lol */ }
          function fakeMethod() { /* lol */ }
          FakeMap.prototype['-omg-lol-i-can-use-whatever-I-want-YOLO-'] = fakeMethod;
          FakeMap.prototype.entries = fakeMethod;
          FakeMap.prototype.size = fakeMethod;
          const root = {
            Map: FakeMap
          };

          const result = symbolIteratorPolyfill(root);
          expect(result).to.equal('-omg-lol-i-can-use-whatever-I-want-YOLO-');
        });
      });

      describe('but Map exists and no other key except "size" on Map.prototype that matches Map.prototype.entries (for es6-shim)', () => {
        it('should return "@@iterator"', () => {
          function FakeMap() { /* lol */ }
          function fakeMethod() { /* lol */ }
          FakeMap.prototype.entries = fakeMethod;
          FakeMap.prototype.size = fakeMethod;
          const root = {
            Map: FakeMap
          };

          const result = symbolIteratorPolyfill(root);
          expect(result).to.equal('@@iterator');
        });
      });

      describe('if Set exists but has no iterator, and Map does not exist (bad polyfill maybe?)', () => {
        it('should return "@@iterator"', () => {
          const result = symbolIteratorPolyfill({
            Set: function () { /* lol */ }
          });
          expect(result).to.equal('@@iterator');
        });
      });

      describe('and root.Set and root.Map do NOT exist', () => {
        it('should return "@@iterator"', () => {
          const result = symbolIteratorPolyfill({});
          expect(result).to.equal('@@iterator');
        });
      });
    });
  });
});