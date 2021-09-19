import { Subscriber } from './Subscriber';
import { ObservableNotification } from './types';

/**
 * The {@link GlobalConfig} object for RxJS. It is used to configure things
 * like how to react on unhandled errors.
 */
export const config: GlobalConfig = {
  onUnhandledError: null,
  onStoppedNotification: null,
  useDeprecatedSynchronousErrorHandling: false,
};

/**
 * The global configuration object for RxJS, used to configure things
 * like how to react on unhandled errors. Accessible via {@link config}
 * object.
 */
export interface GlobalConfig {
  /**
   * A registration point for unhandled errors from RxJS. These are errors that
   * cannot were not handled by consuming code in the usual subscription path. For
   * example, if you have this configured, and you subscribe to an observable without
   * providing an error handler, errors from that subscription will end up here. This
   * will _always_ be called asynchronously on another job in the runtime. This is because
   * we do not want errors thrown in this user-configured handler to interfere with the
   * behavior of the library.
   */
  onUnhandledError: ((err: any) => void) | null;

  /**
   * A registration point for notifications that cannot be sent to subscribers because they
   * have completed, errored or have been explicitly unsubscribed. By default, next, complete
   * and error notifications sent to stopped subscribers are noops. However, sometimes callers
   * might want a different behavior. For example, with sources that attempt to report errors
   * to stopped subscribers, a caller can configure RxJS to throw an unhandled error instead.
   * This will _always_ be called asynchronously on another job in the runtime. This is because
   * we do not want errors thrown in this user-configured handler to interfere with the
   * behavior of the library.
   */
  onStoppedNotification: ((notification: ObservableNotification<any>, subscriber: Subscriber<any>) => void) | null;

  /**
   * If true, turns on synchronous error rethrowing, which is a deprecated behavior
   * in v6 and higher. This behavior enables bad patterns like wrapping a subscribe
   * call in a try/catch block. It also enables producer interference, a nasty bug
   * where a multicast can be broken for all observers by a downstream consumer with
   * an unhandled error. DO NOT USE THIS FLAG UNLESS IT'S NEEDED TO BUY TIME
   * FOR MIGRATION REASONS.
   *
   * @deprecated As of version 8, RxJS will no longer support synchronous throwing
   * of unhandled errors. All errors will be thrown on a separate call stack to prevent bad
   * behaviors described above. Will be removed in v8.
   */
  useDeprecatedSynchronousErrorHandling: boolean;
}
