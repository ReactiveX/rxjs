import { Subject } from 'rxjs/internal/Subject';
import { multicast } from 'rxjs/internal/create/multicast';
import { Observable } from '../Observable';
import { Operation, Sink, FOType } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { lift } from 'rxjs/internal/util/lift';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';

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
