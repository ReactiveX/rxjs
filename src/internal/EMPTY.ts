import { sourceAsObservable, Observable } from "./Observable";
import { Source, FOType, Sink } from "./types";
import { Subscription } from "./Subscription";

export const EMPTY_SOURCE: Source<never> =
  (type: FOType.SUBSCRIBE, sink: Sink<never>, subs: Subscription) => {
    sink(FOType.COMPLETE, undefined, subs);
  }

export const EMPTY: Observable<never> = sourceAsObservable(EMPTY_SOURCE);

