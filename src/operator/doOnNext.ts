import {Observer} from '../Observer';

import {noop} from '../util/noop';
import {_do} from './do';

export function doOnNext<T>(nextOrObserver: Observer<T>|((x: T) => void)) {
  return _do.apply(this, [nextOrObserver, noop, noop]);
}
