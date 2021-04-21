import { Subscriber } from './Subscriber';
import { ObservableNotification, GlobalConfig } from './types';

/**
 * The {@link GlobalConfig} object for RxJS. It is used to configure things
 * like how to react on unhandled errors.
 */
export const config: GlobalConfig = {
  onUnhandledError: null as ((err: any) => void) | null,

  onStoppedNotification: null as ((notification: ObservableNotification<any>, subscriber: Subscriber<any>) => void) | null,

  Promise: undefined as PromiseConstructorLike | undefined,

  useDeprecatedSynchronousErrorHandling: false,

  useDeprecatedNextContext: false,
};
