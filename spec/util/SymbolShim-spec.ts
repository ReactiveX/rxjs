import {polyfillSymbol} from '../../dist/cjs/util/SymbolShim';
import {Map} from '../../dist/cjs/util/Map';

declare const __root__: any;

describe('SymbolShim.polyfillSymbol', () => {
  it('should polyfill Symbol to be a function that returns a primitive that is unique', () => {
    const Symbol = polyfillSymbol({ });

    expect(typeof Symbol).toBe('function');
    const x = Symbol('test');
    const y = Symbol('test');
    expect(x !== y).toBe(true); // should be obvious, but this is the important part.

    expect(x).toBe('@@Symbol(test):0');
    expect(y).toBe('@@Symbol(test):1');
  });

  it('should setup symbol if root does not have it', () => {
    const root = {};

    const result = polyfillSymbol(root);
    expect((<any>root).Symbol).toBeDefined();
    expect(result.observable).toBeDefined();
    expect(result.iterator).toBeDefined();
    expect(result.for).toBeDefined();
  });

  it('should add a for method', () => {
    const root = {};
    const result = polyfillSymbol(root);
    expect(typeof result.for).toBe('function');

    const test = result.for('test');
    expect(test).toBe('@@test');
  });

  it('should add a for method even if Symbol already exists but does not have for', () => {
    const root = {
      Symbol: {}
    };
    const result = polyfillSymbol(root);

    expect(typeof result.for).toBe('function');

    const test = result.for('test');
    expect(test).toBe('@@test');
  });

  describe('when symbols exists on root', () => {
    it('should use symbols from root', () => {
      const root = {
        Symbol: {
          observable: {},
          iterator: {}
        }
      };

      const result = polyfillSymbol(root);
      expect(result.observable).toBe(root.Symbol.observable);
      expect(result.iterator).toBe(root.Symbol.iterator);
    });
  });

  describe('observable symbol', () => {
    it('should patch root using for symbol if exist', () => {
      const root = {
        Symbol: {
          for: (x: any) => x
        }
      };

      const result = polyfillSymbol(root);
      expect(result.observable).toBe(root.Symbol.for('observable'));
    });

    it('should patch root if for symbol does not exist', () => {
      const root = {};

      const result = polyfillSymbol(root);
      expect(result.observable).toBe('@@observable');
    });
  });

  it('should patch root using Symbol.for if exist', () => {
    const root = {
      Symbol: {
        for: (x: any) => x
      }
    };
    const result = polyfillSymbol(root);
    expect(result.iterator).toBe(root.Symbol.for('iterator'));
  });

  it('should patch using Set for mozilla bug', () => {
    function Set() {
      //noop
    }
    Set.prototype['@@iterator'] = () => {
      //noop
    };

    const root = {
      Set: Set,
      Symbol: {}
    };

    const result = polyfillSymbol(root);
    expect(result.iterator).toBe('@@iterator');
  });

  it('should patch using map for es6-shim', () => {
    const root = {
      Map: Map,
      Symbol: {}
    };

    root.Map.prototype.key = 'iteratorValue';
    root.Map.prototype.entries = 'iteratorValue';

    const result = polyfillSymbol(root);
    expect(result.iterator).toBe('key');
  });
});
