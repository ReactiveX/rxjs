import { Subject } from 'rxjs/internal/Subject';
import { FOType, FObsArg, SinkArg } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { sourceAsSubject } from 'rxjs/internal/util/sourceAsSubject';
import { subjectBaseSource } from 'rxjs/internal/sources/subjectBaseSource';

export interface ReplaySubjectConstructor {
  new <T>(bufferSize?: number, windowTime?: number): Subject<T>;
}

interface ReplayValue<T> {
  arg: SinkArg<T>;
  timeout: number;
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
  let _endType: FOType;
  let _endArg: any;

  return ((type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    _base(type, arg, subs);
    const now = Date.now();

    for (let i = 0; i < _buffer.length; i++) {
      const { arg: a, timeout } = _buffer[i];
      if (timeout < now) {
        _buffer.splice(i);
        break;
      }
      if (type === FOType.SUBSCRIBE) {
        arg(FOType.NEXT, a, subs);
      }
    }

    if (_endType) {
      if (type === FOType.SUBSCRIBE) {
        arg(_endType, _endArg, subs);
        subs.unsubscribe();
      }
      return;
    }

    switch (type) {
      case FOType.NEXT:
        _buffer.push({ arg, timeout: now + windowTime });
        if (_buffer.length > bufferSize) {
          _buffer.splice(0, _buffer.length - bufferSize);
        }
        break;
      case FOType.ERROR:
        _endType = FOType.ERROR;
        _endArg = arg;
        break;
      case FOType.COMPLETE:
        _endType = FOType.COMPLETE;
        break;
      default:
        break;
    }
  });
}
