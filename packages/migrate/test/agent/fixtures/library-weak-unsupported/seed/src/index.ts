import { Observable, asyncScheduler, interval, scheduled } from 'rxjs';
import { publishReplay, refCount } from 'rxjs/operators';

export const ticks = () => interval(10, asyncScheduler);
export const legacyScheduled = (values: number[]) => scheduled(values, asyncScheduler);
export const cached = (source: Observable<number>) => source.pipe(publishReplay(1), refCount());
