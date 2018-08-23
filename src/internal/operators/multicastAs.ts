import { Subject } from '../Subject';
import { multicast } from '../create/multicast';
import { Observable } from '../Observable';
import { Operation, Sink, FOType } from '../types';
import { Subscription } from '../Subscription';
import { lift } from '../util/lift';
import { tryUserFunction, resultIsError } from '../util/userFunction';

export function multicastAs<T, R>(subjectOrFactory: Subject<T>|(() => Subject<T>), project: (multicasted: Observable<T>) => Observable<R>): Operation<T, R> {
  return lift((source: Observable<T>, dest: Sink<R>, subs: Subscription) => {
    const multicasted = multicast(source, subjectOrFactory);
    const projected = tryUserFunction(project, multicasted);
    if (resultIsError(projected)) {
      dest(FOType.ERROR, projected.error, subs);
      return;
    }
    projected(FOType.SUBSCRIBE, dest, subs);
    subs.add(multicasted.connect());
  });
}
