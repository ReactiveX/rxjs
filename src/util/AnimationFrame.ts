import { root } from './root';

export class RequestAnimationFrameDefinition {
  cancelAnimationFrame: (handle: number) => void;
  requestAnimationFrame: (cb: () => void) => number;
  constructor(root: any) {
    if (root.requestAnimationFrame) {
      this.cancelAnimationFrame = root.cancelAnimationFrame;
      this.requestAnimationFrame = root.requestAnimationFrame;
    } else if (root.mozRequestAnimationFrame) {
      this.cancelAnimationFrame = root.mozCancelAnimationFrame;
      this.requestAnimationFrame = root.mozRequestAnimationFrame;
    } else if (root.webkitRequestAnimationFrame) {
      this.cancelAnimationFrame = root.webkitCancelAnimationFrame;
      this.requestAnimationFrame = root.webkitRequestAnimationFrame;
    } else if (root.msRequestAnimationFrame) {
      this.cancelAnimationFrame = root.msCancelAnimationFrame;
      this.requestAnimationFrame = root.msRequestAnimationFrame;
    } else if (root.oRequestAnimationFrame) {
      this.cancelAnimationFrame = root.oCancelAnimationFrame;
      this.requestAnimationFrame = root.oRequestAnimationFrame;
    } else {
      this.cancelAnimationFrame = root.clearTimeout;
      this.requestAnimationFrame = function(cb) { return root.setTimeout(cb, 1000 / 60); };
    }
  }
}

export const AnimationFrame = new RequestAnimationFrameDefinition(root);
