import { FOType, FObsArg, FObs } from "rxjs/internal/types";
import { Subscription } from "rxjs/internal/Subscription";
import { ObjectUnsubscribedError } from "../util/ObjectUnsubscribedError";

export function subjectBaseSource<T>(): FObs<T> {
  let state: any[];
  let disposed = false;
  return (type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    if (disposed) {
      throw new ObjectUnsubscribedError();
    }
    if (type === FOType.SUBSCRIBE) {
      state = (state || []);
      state.push(arg, subs);
      subs.add(() => {
        if (!state) return;
        const i = state.indexOf(arg);
        state.splice(i, 2);
      });
    } else if (type === FOType.DISPOSE) {
      disposed = true;
      state = null;
    } else if (state) {
      const copy = state.slice();
      if (type !== FOType.NEXT) {
        state = undefined;
      }
      for (let i = 0; i < copy.length; i += 2) {
        copy[i](type, arg, copy[i + 1]);
      }
    }
  };
}
