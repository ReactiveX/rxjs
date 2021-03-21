import { isFunction } from './isFunction';

export interface ReadableStreamLike<T> {
  getReader(): ReadableStreamDefaultReader<T>;
}

export async function* readableStreamLikeToAsyncGenerator<T>(readableStream: ReadableStreamLike<T>): AsyncGenerator<T> {
  const reader = readableStream.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        return;
      }
      yield value!;
    }
  } finally {
    reader.releaseLock();
  }
}

export function isReadableStreamLike<T>(obj: any): obj is ReadableStreamLike<T> {
  return isFunction(obj?.getReader);
}
