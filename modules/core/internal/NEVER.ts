import { sourceAsObservable } from "./Observable";

export const NEVER = sourceAsObservable(() => { /* noop */ });
