import { sourceAsObservable } from "./Observable";
import { noop } from "./util/noop";

export const NEVER = sourceAsObservable(noop);
