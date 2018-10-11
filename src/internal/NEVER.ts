import { sourceAsObservable } from 'rxjs/internal/util/sourceAsObservable';

export const NEVER = sourceAsObservable(() => { /* noop */ });
