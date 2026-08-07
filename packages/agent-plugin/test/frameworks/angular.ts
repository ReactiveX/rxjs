import { DestroyRef } from '@angular/core';
import { ColdObservable } from 'rxjs';
import { map } from 'rxjs/map';

export function angularValues(destroyRef: DestroyRef) {
  const controller = new AbortController();
  destroyRef.onDestroy(() => controller.abort());
  const values = new ColdObservable<number>((subscriber) => subscriber.next(1));
  return values[map]((value) => value + 1).subscribe(() => {}, { signal: controller.signal });
}
