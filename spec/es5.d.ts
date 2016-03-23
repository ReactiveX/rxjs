interface Symbol { }
interface SymbolConstructor {
  iterator: symbol;
}
declare var Symbol: SymbolConstructor;
interface Iterable<T> {
    [Symbol.iterator](): Iterator<T>;
}
interface Iterator<T> {
    next(value?: any): IteratorResult<T>;
    return?(value?: any): IteratorResult<T>;
    throw?(e?: any): IteratorResult<T>;
}
