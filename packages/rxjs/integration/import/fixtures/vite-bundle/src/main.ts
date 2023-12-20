import * as rx from 'rxjs';
import * as operators from 'rxjs/operators';
import * as ajax from 'rxjs/ajax';
import * as webSocket from 'rxjs/webSocket';
import * as rxFetch from 'rxjs/fetch';
import * as testing from 'rxjs/testing';
import * as coldObservable from 'rxjs/internal/testing/ColdObservable';

declare global {
  interface Window {
    reportDone: any;
  }
}

function runTest() {
  let success = true;

  const assert = (condition: any, message: string) => {
    if (condition) {
      // show a green check mark emoji
      console.log(`✅ ${message}`);
    } else {
      success = false;
      console.log(`❌ ${message}`);
    }
  };

  assert(rx, 'main export should exists');
  assert(operators, 'operator export should exists');
  assert(coldObservable, 'internal can be imported');
  assert(ajax, 'ajax can be imported');
  assert(webSocket, 'webSocket can be imported');
  assert(rxFetch, 'rxFetch can be imported');
  assert(testing, 'testing can be imported');

  // Assert a few key things exist in each of the imported modules
  assert(rx.Observable, 'Observable should exist');
  assert(operators.map, 'map should exist');
  assert(ajax.ajax, 'ajax should exist');
  assert(webSocket.webSocket, 'webSocket should exist');
  assert(rxFetch.fromFetch, 'fromFetch should exist');
  assert(testing.TestScheduler, 'TestScheduler should exist');

  window.reportDone(success);
}

const testButton = document.createElement('button');
testButton.id = 'run-test';
testButton.textContent = 'Run Test';
testButton.addEventListener('click', runTest);
document.body.appendChild(testButton);
