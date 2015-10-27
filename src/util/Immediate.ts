/**
All credit for this helper goes to http://github.com/YuzuJS/setImmediate
*/

// let JSGlobal = global || window || new Function('return this')(),

import {root as JSGlobal} from './root';

export let Immediate = {
  setImmediate: (x) => { return 0; },
  clearImmediate: (id) => {}
};

if (JSGlobal && JSGlobal.setImmediate) {
  Immediate.setImmediate = JSGlobal.setImmediate;
  Immediate.clearImmediate = JSGlobal.clearImmediate;
} else {
  Immediate = (function(global, Immediate) {

    let nextHandle = 1, // Spec says greater than zero
      tasksByHandle = {},
      currentlyRunningATask = false,
      doc = global.document,
      setImmediate;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === '[object process]') {
      // For Node.js before 0.9
      setImmediate = installNextTickImplementation();
    } else if (canUsePostMessage()) {
      // For non-IE10 modern browsers
      setImmediate = installPostMessageImplementation();
    } else if (global.MessageChannel) {
      // For web workers, where supported
      setImmediate = installMessageChannelImplementation();
    } else if (doc && 'onreadystatechange' in doc.createElement('script')) {
      // For IE 6–8
      setImmediate = installReadyStateChangeImplementation();
    } else {
      // For older browsers
      setImmediate = installSetTimeoutImplementation();
    }

    Immediate.setImmediate = setImmediate;
    Immediate.clearImmediate = clearImmediate;

    return Immediate;

    function clearImmediate(handle) {
      delete tasksByHandle[handle];
    }

    function addFromSetImmediateArguments(args) {
      tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
      return nextHandle++;
    }

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.
    function partiallyApplied(handler, ...args) {
      return function() {
        if (typeof handler === 'function') {
          handler.apply(undefined, args);
        } else {
          (new Function('' + handler))();
        }
      };
    }

    function runIfPresent(handle) {
      // From the spec: 'Wait until any invocations of this algorithm started before this one have completed.'
      // So if we're currently running a task, we'll need to delay this invocation.
      if (currentlyRunningATask) {
        // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
        // 'too much recursion' error.
        setTimeout(partiallyApplied(runIfPresent, handle), 0);
      } else {
        let task = tasksByHandle[handle];
        if (task) {
          currentlyRunningATask = true;
          try {
            task();
          } finally {
            clearImmediate(handle);
            currentlyRunningATask = false;
          }
        }
      }
    }

    function installNextTickImplementation() {
      return function setImmediate() {
        let handle = addFromSetImmediateArguments(arguments);
        global.process.nextTick(partiallyApplied(runIfPresent, handle));
        return handle;
      };
    }

    function canUsePostMessage() {
      // The test against `importScripts` prevents this implementation from being installed inside a web worker,
      // where `global.postMessage` means something completely different and can't be used for this purpose.
      if (global.postMessage && !global.importScripts) {
        let postMessageIsAsynchronous = true;
        let oldOnMessage = global.onmessage;
        global.onmessage = function() {
          postMessageIsAsynchronous = false;
        };
        global.postMessage('', '*');
        global.onmessage = oldOnMessage;
        return postMessageIsAsynchronous;
      }
    }

    function installPostMessageImplementation() {
      // Installs an event handler on `global` for the `message` event: see
      // * https://developer.mozilla.org/en/DOM/window.postMessage
      // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

      let messagePrefix = 'setImmediate$' + Math.random() + '$';
      let onGlobalMessage = function(event) {
        if (event.source === global &&
          typeof event.data === 'string' &&
          event.data.indexOf(messagePrefix) === 0) {
          runIfPresent(+event.data.slice(messagePrefix.length));
        }
      };

      if (global.addEventListener) {
        global.addEventListener('message', onGlobalMessage, false);
      } else {
        global.attachEvent('onmessage', onGlobalMessage);
      }

      return function setImmediate() {
        let handle = addFromSetImmediateArguments(arguments);
        global.postMessage(messagePrefix + handle, '*');
        return handle;
      };
    }

    function installMessageChannelImplementation() {
      let channel = new MessageChannel();
      channel.port1.onmessage = function(event) {
        let handle = event.data;
        runIfPresent(handle);
      };

      return function setImmediate() {
        let handle = addFromSetImmediateArguments(arguments);
        channel.port2.postMessage(handle);
        return handle;
      };
    }

    function installReadyStateChangeImplementation() {
      let html = doc.documentElement;
      return function setImmediate() {
        let handle = addFromSetImmediateArguments(arguments);
        // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
        // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
        let script = doc.createElement('script');
        script.onreadystatechange = function () {
          runIfPresent(handle);
          script.onreadystatechange = null;
          html.removeChild(script);
          script = null;
        };
        html.appendChild(script);
        return handle;
      };
    }

    function installSetTimeoutImplementation() {
      return function setImmediate() {
        let handle = addFromSetImmediateArguments(arguments);
        setTimeout(partiallyApplied(runIfPresent, handle), 0);
        return handle;
      };
    }
  }(JSGlobal, Immediate));
}