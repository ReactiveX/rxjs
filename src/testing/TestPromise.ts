import {Scheduler} from '../Scheduler';
import {TestMessage} from './TestMessage';

export class TestPromise<T> {
  public promise: Promise<T>;
  private resolve: (value: T) => void;
  private reject: (error: any) => void;

  constructor(public messages: TestMessage[],
              private scheduler: Scheduler) {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  setup() {
    if (this.messages.length !== 1) {
      return;
    }
    const testPromise = this;
    const promise = this.promise;
    const { frame, notification } = this.messages[0];
    const { kind, value, exception } = notification;
    this.scheduler.schedule(
      () => {
        switch (kind) {
          case 'N':
            return testPromise.resolve.call(
              promise,
              { fromTestPromise: true, frame, value }
            );
          case 'E':
            return testPromise.reject.call(
              promise,
              { fromTestPromise: true, frame, reason: exception }
            );
          case 'C':
            return;
        }
      },
      frame
    );
  }
}
