import { onScopeDispose, shallowRef } from 'vue';
import 'rxjs';

export function useVueObservable<T>(source: Observable<T>, initial: T) {
  const value = shallowRef(initial);
  const controller = new AbortController();
  source.subscribe(
    (next) => {
      value.value = next;
    },
    { signal: controller.signal }
  );
  onScopeDispose(() => controller.abort());
  return value;
}
