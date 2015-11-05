import Subject from '../Subject';
import multicast from './multicast';

export default function publish() {
  return multicast.call(this, new Subject());
}