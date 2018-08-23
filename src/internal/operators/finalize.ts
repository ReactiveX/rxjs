import { Observable } from '../Observable';
import { Operation, FOType, Sink } from '../types';
import { Subscription } from '../Subscription';
import { lift } from '../util/lift';

export function finalize<T>(callback: () => void): Operation<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription) => {
    subs.add(callback);
    source(FOType.SUBSCRIBE, dest, subs);
  });
}
