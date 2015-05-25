import noop from '../util/noop';

export default class Subscription {
  _action:Function
  isDisposed:boolean = false

  constructor(action:Function = noop) {
    this._action = action;
  }

  dispose():void {
    if(!this.isDisposed && this._action) {
      this._action();
    }
    this.isDisposed = true;
  }
}