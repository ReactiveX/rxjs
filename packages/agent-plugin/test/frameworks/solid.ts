import { createSignal, onCleanup } from 'solid-js';
import 'rxjs';

export function createObservableSignal<T>(source: Observable<T>, initial: T) {
  const [value, setValue] = createSignal(initial);
  const controller = new AbortController();
  source.subscribe((next) => setValue(() => next), { signal: controller.signal });
  onCleanup(() => controller.abort());
  return value;
}
