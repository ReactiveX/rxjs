import {root} from './root';

const Object = root.Object;

if (typeof (<any>Object).assign != 'function') {
  (function () {
    (<any>Object).assign = function assignPolyfill(target: Object, ...sources: Array<Object>): Object {
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      const output = Object(target);
      const len = sources.length;
      for (let index = 0; index < len; index++) {
        let source = sources[index];
        if (source !== undefined && source !== null) {
          for (let key in source) {
            if (source.hasOwnProperty(key)) {
              output[key] = source[key];
            }
          }
        }
      }

      return output;
    };
  })();
}

export const assign: (target: Object, ...sources: Array<Object>) => Object = Object.assign;