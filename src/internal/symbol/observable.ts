import { root } from '../util/root';

export function getSymbolObservable(context: { Symbol: SymbolConstructor; }): symbol {
  let $$observable: symbol;
  let Symbol = context.Symbol;

  if (typeof Symbol === 'function') {
    if (Symbol.observable) {
      $$observable = Symbol.observable;
    } else {
      $$observable = Symbol('observable');
      Symbol.observable = $$observable;
    }
  } else {
    $$observable = <any>'@@observable';
  }

  return $$observable;
}

export const observable = getSymbolObservable(root);

/**
 * @deprecated use observable instead
 */
export const $$observable = observable;

declare global {
  interface SymbolConstructor {
    observable: symbol;
  }
}