import Subject from '../Subject';
function subjectFactory() {
    return new Subject();
}
export default function publish() {
    return this.multicast(subjectFactory);
}
