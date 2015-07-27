import Subject from '../Subject';
import multicast from './multicast';

function subjectFactory() {
  return new Subject();
}

export default function publish() {
  return multicast.call(this, subjectFactory);
}