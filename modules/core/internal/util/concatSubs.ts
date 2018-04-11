import { subsAsSubscription, createSubs } from "../Subscription";
import { Subs, FOType } from "../types";

export function concatSubs(subs: Subs, ...teardowns: Array<() => void>) {
  return subsAsSubscription(createSubs(() => {
    subs(FOType.COMPLETE, undefined);
    for (const teardown of teardowns) {
      teardown();
    }
  }));
}
