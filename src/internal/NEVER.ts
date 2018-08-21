import { sourceAsObservable } from './util/sourceAsObservable';

export const NEVER = sourceAsObservable(() => { /* noop */ });
