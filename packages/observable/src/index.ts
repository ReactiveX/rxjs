export { Observable, Subscriber, Subscription, UnsubscriptionError, config, from, isObservable, operate } from './observable.js';
export type { GlobalConfig, SubscriberOverrides } from './observable.js';

// TODO: reevaluate these as part of public API of @rxjs/observable? They aren't exported from rxjs so feel more internal?
export {
  COMPLETE_NOTIFICATION,
  ObservableInputType,
  createNotification,
  errorNotification,
  fromArrayLike,
  getObservableInputType,
  isArrayLike,
  isFunction,
  isPromise,
  nextNotification,
  readableStreamLikeToAsyncGenerator,
  subscribeToArray,
} from './observable.js';
