import {noop} from '../util/noop';
import {_do} from './do';

export function doOnCompleted<T>(complete: () => void) {
  return  _do.apply(this, [noop, noop, complete]);
}
