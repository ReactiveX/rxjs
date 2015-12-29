import {noop} from '../util/noop';
import {_do} from './do';

export function doOnError<T>(error: (e: any) => void) {
  return  _do.apply(this, [noop, error, noop]);
}
