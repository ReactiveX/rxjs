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

let freeGlobal = objectTypes[typeof global] && global;
if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
  root = freeGlobal;
}
