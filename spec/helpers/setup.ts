/**
 * Setup globals for the mocha unit tests such as injecting polyfills
 **/

import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';

if (typeof Symbol !== 'function') {
  let id = 0;
  const symbolFn: any = (description: string) =>
    `Symbol_${id++} ${description} (RxJS Testing Polyfill)`;

  Symbol = symbolFn;
}

if (!(Symbol as any).observable) {
  (Symbol as any).observable = Symbol('Symbol.observable polyfill from RxJS Testing');
}

/** Polyfill requestAnimationFrame for testing animationFrame scheduler in Node */
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function(this: any, window: any) {
  window = window || this;
  let lastTime = 0;
  const vendors = ['ms', 'moz', 'webkit', 'o'];
  for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
                                 || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = (callback: Function, element: any) => {
          const currTime = new Date().getTime();
          const timeToCall = Math.max(0, 16 - (currTime - lastTime));
          const id = window.setTimeout(() => { callback(currTime + timeToCall); },
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
      };
  }

  if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = (id: number) => {
          clearTimeout(id);
      };
  }
}(global));

//setup sinon-chai
chai.use(sinonChai);
