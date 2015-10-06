export default class SubscriptionLog {
  private _subscribedFrame: number;
  private _unsubscribedFrame: number;

  get subscribedFrame(): number {
    return this._subscribedFrame;
  }

  get unsubscribedFrame(): number {
    return this._unsubscribedFrame;
  }

  constructor(subscribedFrame: number,
              unsubscribedFrame: number = Number.POSITIVE_INFINITY) {
    this._subscribedFrame = subscribedFrame;
    this._unsubscribedFrame = unsubscribedFrame;
  }
}