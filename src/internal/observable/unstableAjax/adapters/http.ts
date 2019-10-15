import { throwError } from '../../throwError';

const httpAdapter = () => throwError('default xhr adapter does not support node.js, should provide custom adapter');

export {
  httpAdapter as adapter
};