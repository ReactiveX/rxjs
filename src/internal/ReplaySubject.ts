import { Subject } from './Subject';
import { FOType, FObsArg, SinkArg } from './types';
import { Subscription } from './Subscription';
import { sourceAsSubject } from './util/sourceAsSubject';
import { subjectBaseSource } from './util/subjectBaseSource';

export interface ReplaySubjectConstructor {
  new <T>(bufferSize?: number, windowTime?: number): Subject<T>;
}

interface ReplayValue<T> {
  type: FOType,
  arg: SinkArg<T>,
  timeout: number,
}

export const ReplaySubject: ReplaySubjectConstructor =
  (<T>(
    bufferSize = Number.POSITIVE_INFINITY,
    windowTime = Number.POSITIVE_INFINITY,
  ) => {

  return sourceAsSubject(replaySubjectSource(bufferSize, windowTime));
}) as any;

export function replaySubjectSource<T>(
  bufferSize = Number.POSITIVE_INFINITY,
  windowTime = Number.POSITIVE_INFINITY,
) {
  const _base = subjectBaseSource<T>();
  const _buffer: ReplayValue<T>[] = [];
  let _closed = false;

  return ((type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    _base(type, arg, subs);
    const now = Date.now();

    for (let i = 0; i < _buffer.length; i++) {
      const { type: t, arg: a, timeout } = _buffer[i];
      if (timeout < now) {
        _buffer.splice(i);
        break;
      }
      if (type === FOType.SUBSCRIBE) {
        _base(t, a, subs);
      }
    }

    if (type !== FOType.SUBSCRIBE) {
      if (!_closed) {
        _buffer.push({ type, arg, timeout: now + windowTime });
        if(_buffer.length > bufferSize) {
          _buffer.splice(_buffer.length - bufferSize, bufferSize);
        }
      }
      if (type === FOType.ERROR || type === FOType.COMPLETE) {
        _closed = true;
      }
    }
  });
}

