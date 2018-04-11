import { ObservableInput, Operation, FOType, Sink, SinkArg } from '../types';
import { Observable, sourceAsObservable } from '../Observable';
import { Subscription } from '../Subscription';
import { from } from '../create/from';

export function mergeMap<T, R>(
  project: (value: T, index: number) => ObservableInput<R>,
  concurrent = Number.POSITIVE_INFINITY,
): Operation<T, R> {
  return (source: Observable<T>) =>
    sourceAsObservable((type: FOType, dest: Sink<R>) => {
      if (type === FOType.SUBSCRIBE) {
        let subs: Subscription;
        let counter = 0;
        let active = 0;
        let outerComplete = false;
        const buffer: Array<{outerValue: T, outerIndex: number, innerSource: Observable<R> }> = [];

        let startNextInner: () => void;
        startNextInner = () => {
          while (buffer.length > 0 && active++ < concurrent) {
            const { innerSource, outerValue, outerIndex } = buffer.shift();
            let innerCounter = 0;
            innerSource(FOType.SUBSCRIBE, (type: FOType, v: SinkArg<R>) => {
              switch (type) {
                case FOType.SUBSCRIBE:
                  if (subs) {
                    subs.add(v);
                  }
                  break;
                case FOType.NEXT:
                  dest(FOType.NEXT, v);
                  break;
                case FOType.ERROR:
                  dest(FOType.ERROR, v);
                  subs.unsubscribe();
                  break;
                case FOType.COMPLETE:
                  active--;
                  if (buffer.length > 0) {
                    startNextInner();
                  } else {
                    if (outerComplete && active === 0) {
                      dest(FOType.COMPLETE, undefined);
                      subs.unsubscribe();
                    }
                  }
                default:
              }
            });
          }
        }

        source(type, (t: FOType, v: SinkArg<T>) => {
          switch (t) {
            case FOType.SUBSCRIBE:
              subs = v;
              break;
            case FOType.NEXT:
              let innerSource: Observable<R>;
              let outerIndex = counter++;
              try {
                innerSource = from(project(v, outerIndex));
              } catch (err) {
                dest(FOType.ERROR, err);
                subs.unsubscribe();
                return;
              }
              buffer.push({ innerSource, outerValue: v, outerIndex });
              break;
            case FOType.ERROR:
              dest(t, v);
              subs.unsubscribe();
              break;
            case FOType.COMPLETE:
              outerComplete = true;
              if (buffer.length > 0) {
                startNextInner();
              } else if (active === 0) {
                dest(FOType.COMPLETE, undefined);
                subs.unsubscribe();
              }
              break;
            default:
          }
        });
      }
    });
}
