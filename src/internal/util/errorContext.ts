import { config } from '../config';

let context: { errorThrown: boolean; error: any } | null = null;

export function errorContext(cb: () => void) {
  if (config.useDeprecatedSynchronousErrorHandling) {
    const isRoot = !context;
    if (isRoot) {
      context = { errorThrown: false, error: null };
    }
    cb();
    if (isRoot) {
      const { errorThrown, error } = context!;
      context = null;
      if (errorThrown) {
        throw error;
      }
    }
  } else {
    cb();
  }
}

export function captureError(err: any) {
  if (config.useDeprecatedSynchronousErrorHandling && context) {
    context.errorThrown = true;
    context.error = err;
  }
}
