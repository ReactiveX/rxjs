if (typeof Symbol !== 'function') {
  let id = 0;
  const symbolFn: any = (description: string) =>
    `Symbol_${id++} ${description} (RxJS Testing Polyfill)`;

  Symbol = symbolFn;
}

if (!(Symbol as any).observable) {
  (Symbol as any).observable = Symbol('Symbol.observable polyfill from RxJS Testing');
}
