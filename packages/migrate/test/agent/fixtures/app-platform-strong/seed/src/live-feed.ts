import { BehaviorSubject, Observable, share } from 'rxjs';

export const status = new BehaviorSubject('idle');

export function liveFeed(log: string[]): Observable<number> {
  return new Observable<number>((subscriber) => {
    log.push('start');
    subscriber.next(1);
    return () => log.push('stop');
  }).pipe(share());
}
