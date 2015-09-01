import Subject from '../Subject';

export default class GroupSubject<T> extends Subject<T> {
  constructor(public key: string) {
    super();
  }
}