// TODO: require rxjs/core as a peer dep
import { Scheduler, ObservableInput, FOType, Sink } from "../../../core/internal/types";
import { isArrayLike } from "../../../core/internal/util/isArrayLike";
import { sourceAsObservable } from "../../../core/internal/Observable";
import { Subscription } from "../../../core/internal/Subscription";

export function fromScheduled<T>(input: ObservableInput<T>, scheduler: Scheduler) {
  if (isArrayLike(input)) {
    return sourceAsObservable(fromArrayLikeScheduledSource(input, scheduler));
  }
}

function fromArrayLikeScheduledSource<T>(
  input: ArrayLike<T>,
  scheduler: Scheduler,
) {
  return (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    let i = 0;
    let closed = false;
    if (type === FOType.SUBSCRIBE) {
      subs.add(() => closed = true);

      let schedule: () => void;
      schedule = () => scheduler.schedule(() => {
        if (i < input.length) {
          sink(FOType.NEXT, input[i++], subs);
          schedule();
        } else {
          sink(FOType.COMPLETE, undefined, subs);
        }
      }, 0, null, subs);
      schedule();
    }
  };
}
