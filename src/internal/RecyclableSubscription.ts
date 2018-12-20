import { Subscription, teardownToFunction } from 'rxjs/internal/Subscription';

export class RecyclableSubscription extends Subscription {
  recycle() {
    const { _teardowns } = this;
    while (_teardowns.length > 0) {
      teardownToFunction(_teardowns.shift())();
    }
  }
}
