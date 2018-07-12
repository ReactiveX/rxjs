import { Subject } from "./Subject";
import { FOType, FObsArg, SinkArg, Sink } from "./types";
import { Subscription } from "./Subscription";
import { sourceAsObservable } from "./Observable";
import { subjectBaseSource, sourceAsSubject } from "./util/subjectBase";

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
  const base = subjectBaseSource<T>();
  const buffer: ReplayValue<T>[] = [];
  let closed = false;

  let result = ((type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    base(type, arg, subs);
    const now = Date.now();

    for (let i = 0; i < buffer.length; i++) {
      const { type: t, arg: a, timeout } = buffer[i];
      if (timeout < now) {
        buffer.splice(i);
        break;
      }
      if (type === FOType.SUBSCRIBE) {
        base(t, a, subs);
      }
    }

    if (type != FOType.SUBSCRIBE) {
      if (!closed) {
        buffer.push({ type, arg, timeout: now + windowTime });
      }
      if (type === FOType.ERROR || type === FOType.COMPLETE) {
        closed = true;
      }
    }
  });

  return sourceAsSubject(result);
}) as any;

