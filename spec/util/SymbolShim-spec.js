/* globals __root__ */
var SymbolDefinition = require('../../dist/cjs/util/SymbolShim').SymbolDefinition;
var Map = require('../../dist/cjs/util/Map').Map;
var Rx = require('../../dist/cjs/Rx');

describe('SymbolDefinition', function () {
  it('should setup symbol if root does not have it', function () {
    var root = {};

    var result = new SymbolDefinition(root);
    expect(root.Symbol).toBeDefined();
    expect(result.observable).toBeDefined();
    expect(result.iterator).toBeDefined();
  });

  it('should have observable, iterator symbols', function () {
    var result = new SymbolDefinition(__root__);

    expect(typeof result.observable).toBe('symbol');
    expect(typeof result.iterator).toBe('symbol');
  });

  describe('when symbols exists on root', function () {
    it('should use symbols from root', function () {
      var root = {
        Symbol: {
          observable: {},
          iterator: {}
        }
      };

      var result = new SymbolDefinition(root);
      expect(result.observable).toBe(root.Symbol.observable);
      expect(result.iterator).toBe(root.Symbol.iterator);
    });
  });

  describe('observable symbol', function () {
    it('should patch root using for symbol if exist', function () {
      var root = {
        Symbol: {
          for: function (x) { return x; }
        }
      };

      var result = new SymbolDefinition(root);
      expect(result.observable).toBe(root.Symbol.for('observable'));
    });

    it('should patch root if for symbol does not exist', function () {
      var root = {};

      var result = new SymbolDefinition(root);
      expect(result.observable).toBe('@@observable');
    });
  });

  describe('iterator symbol', function () {
    it('should patch root using for symbol if exist', function () {
      var root = {
        Symbol: {
          for: function (x) { return x; }
        }
      };

      var result = new SymbolDefinition(root);
      expect(result.iterator).toBe(root.Symbol.for('iterator'));
    });

    it('should patch root if for symbol does not exist', function () {
      var root = {};

      var result = new SymbolDefinition(root);
      expect(result.iterator).toBe('@@iterator');
    });

    it('should patch using set for mozilla', function () {
      var root = {
        Set: function () {
          var ret = {};
          ret['@@iterator'] = function () {};
          return ret;
        }
      };

      var result = new SymbolDefinition(root);
      expect(result.iterator).toBe('@@iterator');
    });

    it('should patch using map for es6-shim', function () {
      var root = {
        Map: Map
      };

      root.Map.prototype.key = 'iteratorValue';
      root.Map.prototype.entries = 'iteratorValue';

      var result = new SymbolDefinition(root);
      expect(result.iterator).toBe('key');
    });
  });
});