import { isFunction } from './isFunction';

// We shouldn't rely on this type definition being available globally yet since it's
// not necessarily available in every TS environment.
interface ReadableStreamDefaultReaderLike<T> {
  read(): IteratorResult<T>;
  releaseLock(): void;
}

// This is the only part that matters to us.
export interface ReadableStreamLike<T> {
  getReader(): ReadableStreamDefaultReaderLike<T>;
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
  // We don't want to use instanceof checks because they would return
  // false for instances from another Realm, like an <iframe>.
  return isFunction(obj?.getReader);
}
