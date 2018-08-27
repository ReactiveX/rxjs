export const symbolIterator = (typeof Symbol !== 'function' || !Symbol.iterator) ? '@@iterator' : Symbol.iterator;
