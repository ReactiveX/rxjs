import { FOType, FObsArg, FObs } from "rxjs/internal/types";
import { Subscription } from "rxjs/internal/Subscription";

export function subjectBaseSource<T>(): FObs<T> {
  let state: any[];

  return (type: FOType, arg: FObsArg<T>, subs: Subscription) => {
    switch (type) {
      case FOType.SUBSCRIBE:
        state = (state || []);
        state.push(arg, subs);
        subs.add(() => {
          const i = state.indexOf(arg);
          state.splice(i, 2);
        });
        break;
      case FOType.NEXT:
        if (state) {
          for (let i = 0; i < state.length; i += 2) {
            state[i](type, arg, state[i + 1]);
          }
        }
        break;
      case FOType.ERROR:
      case FOType.COMPLETE:
        if (state) {
          while (state.length > 0) {
            const sink = state.shift();
            const childSubs = state.shift();
            sink(type, arg, childSubs);
          }
        }
        break;
      default:
        break;
    }
  };
}
