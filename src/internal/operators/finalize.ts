import { Observable } from '../Observable';
import { Operation, FOType, Sink } from '../types';
import { Subscription } from '../Subscription';
import { operator } from '../util/operator';

export function finalize<T>(callback: () => void): Operation<T, T> {
  return operator((source: Observable<T>, type: FOType, dest: Sink<T>, subs: Subscription) => {
    subs.add(callback);
    source(FOType.SUBSCRIBE, dest, subs);
  });
}
