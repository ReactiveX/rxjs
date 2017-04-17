//Represents current 'Observable'

export interface Operators<T> {
  map?(): Operators<any>;
  filter?(): Operators<any>;
}

export class CoreObservable<T> implements Operators<T> {
  filter(): Operators<any> {
    console.log('filter');
    return this;
  }

  static of: () => CoreObservable<any>;
}

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
  derivedCtor.of = function () {
    return new derivedCtor();
  };

  console.log('mixin called');

  baseCtors.forEach(baseCtor => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
          derivedCtor.prototype[name] = baseCtor.prototype[name];
      })
  });
}

export default CoreObservable;