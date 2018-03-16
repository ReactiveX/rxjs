import { Observable, NEVER } from 'rxjs';

export function never<T> () {
  return NEVER;
}