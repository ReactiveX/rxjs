import { sourceAsObservable, Observable } from "./Observable";
import { Source, FOType, Sink } from "rxjs/internal/types";
import { Subscription } from "rxjs/internal/Subscription";

export const EMPTY_SOURCE: Source<never> =
  (type: FOType.SUBSCRIBE, sink: Sink<never>, subs: Subscription) => {
    if (type === FOType.SUBSCRIBE) {
      sink(FOType.COMPLETE, undefined, subs);
    }
  };

export const EMPTY: Observable<never> = sourceAsObservable(EMPTY_SOURCE);

