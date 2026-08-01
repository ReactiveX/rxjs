import { Observable, map } from 'rxjs';

export function request(log: string[]): Observable<number> {
  return new Observable((subscriber) => {
    log.push('start');
    subscriber.next(21);
    return () => log.push('stop');
  }).pipe(map((value) => value * 2));
}
