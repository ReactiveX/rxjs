const isBuffer = (obj: unknown): obj is Buffer => Buffer.isBuffer(obj);

export {
  isBuffer
};