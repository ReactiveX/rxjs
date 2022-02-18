/** Symbol.observable or a string "@@observable". Used for interop */
export const observable = (() => (typeof Symbol === 'function' && Symbol.observable) || '@@observable')();
export const observableTypeRef = {
  symbol: observable as Exclude<typeof observable, string>,
};
