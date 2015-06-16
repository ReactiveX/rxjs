var objectTypes = {
  'boolean': false,
  'function': true,
  'object': true,
  'number': false,
  'string': false,
  'undefined': false
};

declare var global:NodeJS.Global;
declare var module:any;
declare var exports:any;

declare module NodeJS {
  interface Global {
    window:any
    global:any
  }
}

var root = (objectTypes[typeof window] && window) || this,
  freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports,
  freeModule = objectTypes[typeof module] && module && !module.nodeType && module,
  moduleExports = freeModule && freeModule.exports === freeExports && freeExports,
  freeGlobal = objectTypes[typeof global] && global;

if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
  root = freeGlobal;
}

export default root;
