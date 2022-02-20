/** Symbol.observable or a string "@@observable". Used for interop */
export const observable: typeof Symbol.observable = (() => (typeof Symbol === 'function' && Symbol.observable) || '@@observable')() as any;
