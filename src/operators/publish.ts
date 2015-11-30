import {Subject} from '../Subject';
import {Observable} from '../Observable';
import {multicast} from './multicast';

export function publish() {
  return multicast.call(this, new Subject());
}

Observable.prototype.publish = publish;
