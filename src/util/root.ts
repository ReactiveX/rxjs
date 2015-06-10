function isObjectOrFunction(obj) {
  let type = typeof obj;
  return type === 'object' || type === 'function';
}

var global = global;

var root = (isObjectOrFunction(window) && window) || this,
    freeGlobal = isObjectOrFunction(global) && global;

if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
}

export default root;
