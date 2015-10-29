let objectTypes = {
  'boolean': false,
  'function': true,
  'object': true,
  'number': false,
  'string': false,
  'undefined': false
};

declare let global: NodeJS.Global;
declare let module: any;
declare let exports: any;

declare module NodeJS {
  interface Global {
    window: any;
    global: any;
  }
}

export let root: any = (objectTypes[typeof self] && self) || (objectTypes[typeof window] && window);

/* tslint:disable:no-unused-variable */
let freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
let freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
let freeGlobal = objectTypes[typeof global] && global;

if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
  root = freeGlobal;
}
