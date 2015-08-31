import $$observer from './Symbol_observer';

export default function isObservable(x): boolean {
  return x && typeof x[$$observer] === 'function';
}