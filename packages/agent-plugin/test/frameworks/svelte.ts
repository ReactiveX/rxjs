import { onDestroy } from 'svelte';
import 'rxjs';

export function observeInSvelte<T>(source: Observable<T>, receive: (value: T) => void): void {
  const controller = new AbortController();
  source.subscribe(receive, { signal: controller.signal });
  onDestroy(() => controller.abort());
}
