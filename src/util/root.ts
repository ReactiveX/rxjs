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

export var root:any = (objectTypes[typeof self] && self) || (objectTypes[typeof window] && window);

var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
var freeGlobal = objectTypes[typeof global] && global;

if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
}
