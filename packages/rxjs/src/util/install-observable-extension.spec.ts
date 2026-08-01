import { describe, expect, it } from 'vitest';
import { installObservableExtension } from './install-observable-extension.js';

describe('installObservableExtension', () => {
  it('installs non-enumerable static and instance implementations atomically', () => {
    const targets = createTargets();
    const symbol = Symbol('example');
    const staticImplementation = () => 'static';
    const instanceImplementation = () => 'instance';

    installObservableExtension({
      instance: instanceImplementation,
      name: 'example',
      static: staticImplementation,
      symbol,
      targets,
    });

    expect(Object.getOwnPropertyDescriptor(targets.constructor, symbol)).toEqual({
      configurable: true,
      enumerable: false,
      value: staticImplementation,
      writable: true,
    });
    expect(Object.getOwnPropertyDescriptor(targets.prototype, symbol)).toEqual({
      configurable: true,
      enumerable: false,
      value: instanceImplementation,
      writable: true,
    });
  });

  it('accepts an identical implementation idempotently', () => {
    const targets = createTargets();
    const symbol = Symbol('example');
    const implementation = () => 'instance';
    const options = { instance: implementation, name: 'example', symbol, targets };

    installObservableExtension(options);
    installObservableExtension(options);

    expect(targets.prototype[symbol]).toBe(implementation);
  });

  it('rejects an exact-key conflict without installing another target', () => {
    const targets = createTargets();
    const symbol = Symbol('example');
    Object.defineProperty(targets.constructor, symbol, { value: () => 'occupied' });

    expect(() =>
      installObservableExtension({
        instance: () => 'instance',
        name: 'example',
        static: () => 'static',
        symbol,
        targets,
      })
    ).toThrow('Cannot install RxJS example extension on Observable: exact Symbol(example) is already occupied');
    expect(Object.hasOwn(targets.prototype, symbol)).toBe(false);
  });

  it('reports a non-extensible target without partial installation', () => {
    const targets = createTargets();
    const symbol = Symbol('example');
    Object.preventExtensions(targets.constructor);

    expect(() =>
      installObservableExtension({
        instance: () => 'instance',
        name: 'example',
        static: () => 'static',
        symbol,
        targets,
      })
    ).toThrow('Cannot install RxJS example extension on Observable: target is not extensible');
    expect(Object.hasOwn(targets.prototype, symbol)).toBe(false);
  });

  it('rolls back an earlier definition when a later target rejects mutation', () => {
    const symbol = Symbol('example');
    const constructorTarget: Record<PropertyKey, unknown> = {};
    const prototypeTarget = new Proxy<Record<PropertyKey, unknown>>(
      {},
      {
        defineProperty: () => {
          throw new Error('rejected');
        },
      }
    );

    expect(() =>
      installObservableExtension({
        instance: () => 'instance',
        name: 'example',
        static: () => 'static',
        symbol,
        targets: { constructor: constructorTarget, prototype: prototypeTarget },
      })
    ).toThrow('property definition failed and the installation was rolled back');
    expect(Object.hasOwn(constructorTarget, symbol)).toBe(false);
    expect(Object.hasOwn(prototypeTarget, symbol)).toBe(false);
  });

  it('rejects an installation with no implementation', () => {
    expect(() => installObservableExtension({ name: 'example', symbol: Symbol('example'), targets: createTargets() })).toThrow(
      'Cannot install RxJS example extension: no implementation was provided'
    );
  });
});

function createTargets(): ExtensionTargets {
  return {
    constructor: {},
    prototype: {},
  };
}

interface ExtensionTargets {
  constructor: Record<PropertyKey, unknown>;
  prototype: Record<PropertyKey, unknown>;
}
