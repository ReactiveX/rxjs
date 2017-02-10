import { AsyncAction } from './AsyncAction';
import { AsyncScheduler } from './AsyncScheduler';

export class AsapScheduler extends AsyncScheduler {
  public flush(action?: AsyncAction<any>): void {
    const {actions} = this;

    this.active = true;
    this.scheduled = undefined;

    let error: any;
    let index: number = -1;
    let count: number = actions.length;
    action = action || actions.shift()!; // TODO: make sure actions has always at least one element

    do {
      if (error = action.execute(action.state, action.delay)) {
        break;
      }
    } while (++index < count && (action = actions.shift()));

    this.active = false;

    if (error) {
      while (++index < count && (action = actions.shift())) {
        action.unsubscribe();
      }
      throw error;
    }
  }
}
