import { FOType, FObsArg, FObs } from "rxjs/internal/types";
import { Subscription } from "rxjs/internal/Subscription";

export function subjectBaseSource<T>(): FObs<T> {
  let state: any[];

  return (type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      state = (state || []);
      if (!subs) {
        throw new Error();
      }
      state.push(arg, subs);
      subs.add(() => {
        if (!state) return;
        const i = state.indexOf(arg);
        state.splice(i, 2);
      });
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
