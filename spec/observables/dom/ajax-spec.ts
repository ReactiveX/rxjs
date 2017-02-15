import {expect} from 'chai';
import * as sinon from 'sinon';
import * as Rx from '../../../dist/cjs/Rx';
import {root} from '../../../dist/cjs/util/root';

declare const global: any;

/** @test {ajax} */
describe('Observable.ajax', () => {
  let gXHR: XMLHttpRequest;
  let rXHR: XMLHttpRequest;

  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    gXHR = global.XMLHttpRequest;
    rXHR = root.XMLHttpRequest;

    global.XMLHttpRequest = MockXMLHttpRequest;
    root.XMLHttpRequest = MockXMLHttpRequest;
  });

  afterEach(() => {
    sandbox.restore();
    MockXMLHttpRequest.clearRequest();

    global.XMLHttpRequest = gXHR;
    root.XMLHttpRequest = rXHR;

    root.XDomainRequest = null;
    root.ActiveXObject = null;
  });

  it('should create default XMLHttpRequest for non CORS', () => {
    const obj: Rx.AjaxRequest = {
      url: '/',
      method: ''
    };

    Rx.Observable.ajax(obj).subscribe();
    expect(MockXMLHttpRequest.mostRecent.withCredentials).to.be.false;
  });

  it('should try to create AXObject for XHR in old version of IE', () => {
    const axObjectStub = sandbox.stub();
    axObjectStub.returns(sinon.stub(new MockXMLHttpRequest()));
    root.ActiveXObject = axObjectStub;
    root.XMLHttpRequest = null;

    const obj: Rx.AjaxRequest = {
      url: '/',
      method: ''
    };

    Rx.Observable.ajax(obj).subscribe();
    expect(axObjectStub).to.have.been.called;
  });

  it('should throw if not able to create XMLHttpRequest', () => {
    root.XMLHttpRequest = null;
    root.ActiveXObject = null;

    const obj: Rx.AjaxRequest = {
      url: '/',
      method: ''
    };

    expect(() => {
      Rx.Observable.ajax(obj).subscribe();
    }).to.throw();
  });

  it('should create XMLHttpRequest for CORS', () => {
    const obj: Rx.AjaxRequest = {
      url: '/',
      method: '',
      crossDomain: true,
      withCredentials: true
    };

    Rx.Observable.ajax(obj).subscribe();
    expect(MockXMLHttpRequest.mostRecent.withCredentials).to.be.true;
  });

  it('should try to create XDomainRequest for CORS if XMLHttpRequest is not available', () => {
    const xDomainStub = sandbox.stub();
    xDomainStub.returns(sinon.stub(new MockXMLHttpRequest()));
    root.XDomainRequest = xDomainStub;
    root.XMLHttpRequest = null;

    const obj: Rx.AjaxRequest = {
      url: '/',
      method: '',
      crossDomain: true,
      withCredentials: true
    };

    Rx.Observable.ajax(obj).subscribe();
    expect(xDomainStub).to.have.been.called;
  });

  it('should throw if not able to create CORS request', () => {
    root.XMLHttpRequest = null;
    root.XDomainRequest = null;

    const obj: Rx.AjaxRequest = {
      url: '/',
      method: '',
      crossDomain: true,
      withCredentials: true
    };

    expect(() => {
      Rx.Observable.ajax(obj).subscribe();
    }).to.throw();
  });

  it('should set headers', () => {
    const obj: Rx.AjaxRequest = {
      url: '/talk-to-me-goose',
      headers: {
        'Content-Type': 'kenny/loggins',
        'Fly-Into-The': 'Dangah Zone!',
        'Take-A-Ride-Into-The': 'Danger ZoooOoone!'
      },
      method: ''
    };

    Rx.Observable.ajax(obj).subscribe();

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.url).to.equal('/talk-to-me-goose');
    expect(request.requestHeaders).to.deep.equal({
      'Content-Type': 'kenny/loggins',
      'Fly-Into-The': 'Dangah Zone!',
      'Take-A-Ride-Into-The': 'Danger ZoooOoone!',
      'X-Requested-With': 'XMLHttpRequest'
    });
  });

  it('should not set default Content-Type header when no body is sent', () => {
    const obj: Rx.AjaxRequest = {
      url: '/talk-to-me-goose',
      method: 'GET'
    };

    Rx.Observable.ajax(obj).subscribe();

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.url).to.equal('/talk-to-me-goose');
    expect(request.requestHeaders).to.not.have.keys('Content-Type');
  });

  it('should error if createXHR throws', () => {
    let error;
    const obj = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      createXHR: () => {
        throw new Error('wokka wokka');
      }
    };

    Rx.Observable.ajax(<any>obj)
      .subscribe((x: any) => {
        throw 'should not next';
      }, (err: any) => {
        error = err;
      }, () => {
        throw 'should not complete';
      });

    expect(error).to.be.an('error', 'wokka wokka');
  });

  it('should error if send request throws', (done: MochaDone) => {
    const expected = new Error('xhr send failure');

    const obj = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      method: '',
      createXHR: () => {
        const ret = new MockXMLHttpRequest();
        ret.send = () => {
          throw expected;
        };
        return ret as any;
      }
    };

    Rx.Observable.ajax(obj)
      .subscribe(() => {
        done(new Error('should not be called'));
      }, (e: Error) => {
        expect(e).to.be.equal(expected);
        done();
      }, () => {
        done(new Error('should not be called'));
      });
  });

  it('should succeed on 200', () => {
    const expected = { foo: 'bar' };
    let result;
    let complete = false;
    const obj = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      method: ''
    };

    Rx.Observable.ajax(obj)
      .subscribe((x: any) => {
        result = x;
      }, null, () => {
        complete = true;
      });

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 200,
      'contentType': 'application/json',
      'responseText': JSON.stringify(expected)
    });

    expect(result.xhr).exist;
    expect(result.response).to.deep.equal(JSON.stringify({ foo: 'bar' }));
    expect(complete).to.be.true;
  });

  it('should fail on 404', () => {
    let error;
    const obj = {
      url: '/flibbertyJibbet',
      normalizeError: (e: any, xhr: any, type: any) => {
        return xhr.response || xhr.responseText;
      },
      responseType: 'text',
      method: ''
    };

    Rx.Observable.ajax(obj)
      .subscribe((x: any) => {
        throw 'should not next';
      }, (err: any) => {
        error = err;
      }, () => {
        throw 'should not complete';
      });

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 404,
      'contentType': 'text/plain',
      'responseText': 'Wee! I am text!'
    });

    expect(error instanceof Rx.AjaxError).to.be.true;
    expect(error.message).to.equal('ajax error 404');
    expect(error.status).to.equal(404);
  });

  it('should fail on 404', () => {
    let error;
    const obj = {
      url: '/flibbertyJibbet',
      normalizeError: (e: any, xhr: any, type: any) => {
        return xhr.response || xhr.responseText;
      },
      responseType: 'text',
      method: ''
    };

    Rx.Observable.ajax(obj).subscribe(x => {
      throw 'should not next';
    }, (err: any) => {
      error = err;
    }, () => {
      throw 'should not complete';
    });

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 300,
      'contentType': 'text/plain',
      'responseText': 'Wee! I am text!'
    });

    expect(error instanceof Rx.AjaxError).to.be.true;
    expect(error.message).to.equal('ajax error 300');
    expect(error.status).to.equal(300);
  });

  it('should succeed no settings', () => {
    const expected = JSON.stringify({ foo: 'bar' });

    Rx.Observable.ajax('/flibbertyJibbet')
      .subscribe((x: any) => {
        expect(x.status).to.equal(200);
        expect(x.xhr.method).to.equal('GET');
        expect(x.xhr.responseText).to.equal(expected);
      }, () => {
        throw 'should not have been called';
      });

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 200,
      'contentType': 'text/plain',
      'responseText': expected
    });
  });

  it('should fail no settings', () => {
    const expected = JSON.stringify({ foo: 'bar' });

    Rx.Observable.ajax('/flibbertyJibbet')
      .subscribe(() => {
        throw 'should not have been called';
      }, (x: any) => {
        expect(x.status).to.equal(500);
        expect(x.xhr.method).to.equal('GET');
        expect(x.xhr.responseText).to.equal(expected);
      }, () => {
        throw 'should not have been called';
      });

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 500,
      'contentType': 'text/plain',
      'responseText': expected
    });
  });

  describe('ajax request body', () => {
    let rFormData: FormData;

    beforeEach(() => {
      rFormData = root.FormData;
      root.FormData = root.FormData || class { };
    });

    afterEach(() => {
      root.FormData = rFormData;
    });

    it('can take string body', () => {
      const obj = {
        url: '/flibbertyJibbet',
        method: '',
        body: 'foobar'
      };

      Rx.Observable.ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal('foobar');
    });

    it('can take FormData body', () => {
      const body = new root.FormData();
      const obj = {
        url: '/flibbertyJibbet',
        method: '',
        body: body
      };

      Rx.Observable.ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.deep.equal(body);
      expect(MockXMLHttpRequest.mostRecent.requestHeaders).to.deep.equal({
        'X-Requested-With': 'XMLHttpRequest',
      });
    });

    it('should not fail when FormData is undefined', () => {
      root.FormData = void 0;

      const obj = {
        url: '/flibbertyJibbet',
        method: '',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: { '🌟': '🚀' }
      };

      Rx.Observable.ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
    });

    it('should send by form-urlencoded format', () => {
      const body = {
        '🌟': '🚀'
      };
      const obj = {
        url: '/flibbertyJibbet',
        method: '',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
      };

      Rx.Observable.ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal('%F0%9F%8C%9F=%F0%9F%9A%80');
    });

    it('should send by JSON', () => {
      const body = {
        '🌟': '🚀'
      };
      const obj = {
        url: '/flibbertyJibbet',
        method: '',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body
      };

      Rx.Observable.ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal('{"🌟":"🚀"}');
    });

    it('should error if send request throws', (done: MochaDone) => {
      const expected = new Error('xhr send failure');

      const obj = {
        url: '/flibbertyJibbet',
        responseType: 'text',
        method: '',
        body: 'foobar',
        createXHR: () => {
          const ret = new MockXMLHttpRequest();
          ret.send = () => {
            throw expected;
          };
          return ret as any;
        }
      };

      Rx.Observable.ajax(obj)
        .subscribe(() => {
          done(new Error('should not be called'));
        }, (e: Error) => {
          expect(e).to.be.equal(expected);
          done();
        }, () => {
          done(new Error('should not be called'));
        });
    });
  });

  describe('ajax.get', () => {
    it('should succeed on 200', () => {
      const expected = { foo: 'bar' };
      let result;
      let complete = false;

      Rx.Observable
        .ajax.get('/flibbertyJibbet')
        .subscribe(x => {
          result = x.response;
        }, null, () => {
          complete = true;
        });

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('/flibbertyJibbet');

      request.respondWith({
        'status': 200,
        'contentType': 'application/json',
        'responseText': JSON.stringify(expected)
      });

      expect(result).to.deep.equal(expected);
      expect(complete).to.be.true;
    });

    it('should succeed on 204 No Content', () => {
      const expected = null;
      let result;
      let complete = false;

      Rx.Observable
        .ajax.get('/flibbertyJibbet')
        .subscribe(x => {
          result = x.response;
        }, null, () => {
          complete = true;
        });

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('/flibbertyJibbet');

      request.respondWith({
        'status': 204,
        'contentType': 'application/json',
        'responseText': expected
      });

      expect(result).to.deep.equal(expected);
      expect(complete).to.be.true;
    });

    it('should able to select json response via getJSON', () => {
      const expected = { foo: 'bar' };
      let result;
      let complete = false;

      Rx.Observable
        .ajax.getJSON('/flibbertyJibbet')
        .subscribe(x => {
          result = x;
        }, null, () => {
          complete = true;
        });

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('/flibbertyJibbet');

      request.respondWith({
        'status': 200,
        'contentType': 'application/json',
        'responseText': JSON.stringify(expected)
      });

      expect(result).to.deep.equal(expected);
      expect(complete).to.be.true;
    });
  });

  describe('ajax.post', () => {

    it('should succeed on 200', () => {
      const expected = { foo: 'bar', hi: 'there you' };
      let result: Rx.AjaxResponse;
      let complete = false;

      Rx.Observable
        .ajax.post('/flibbertyJibbet', expected)
        .subscribe(x => {
          result = x;
        }, null, () => {
          complete = true;
        });

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.method).to.equal('POST');
      expect(request.url).to.equal('/flibbertyJibbet');
      expect(request.requestHeaders).to.deep.equal({
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      });

      request.respondWith({
        'status': 200,
        'contentType': 'application/json',
        'responseText': JSON.stringify(expected)
      });

      expect(request.data).to.equal('foo=bar&hi=there%20you');
      expect(result.response).to.deep.equal(expected);
      expect(complete).to.be.true;
    });

    it('should succeed on 204 No Content', () => {
      const expected = null;
      let result: Rx.AjaxResponse;
      let complete = false;

      Rx.Observable
        .ajax.post('/flibbertyJibbet', expected)
        .subscribe(x => {
          result = x;
        }, null, () => {
          complete = true;
        });

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.method).to.equal('POST');
      expect(request.url).to.equal('/flibbertyJibbet');
      expect(request.requestHeaders).to.deep.equal({
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      });

      request.respondWith({
        'status': 204,
        'contentType': 'application/json',
        'responseType': 'json',
        'responseText': expected
      });

      expect(result.response).to.equal(expected);
      expect(complete).to.be.true;
    });

    it('should succeed in IE on 204 No Content', () => {
      const expected = null;
      let result: Rx.AjaxResponse;
      let complete = false;

      root.XMLHttpRequest = MockXMLHttpRequestInternetExplorer;

      Rx.Observable
        .ajax.post('/flibbertyJibbet', expected)
        .subscribe(x => {
          result = x;
        }, null, () => {
          complete = true;
        });

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.method).to.equal('POST');
      expect(request.url).to.equal('/flibbertyJibbet');
      expect(request.requestHeaders).to.deep.equal({
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      });

      //IE behavior: IE does not provide the a responseText property, so also exercise the code which handles this.
      request.respondWith({
          'status': 204,
          'contentType': 'application/json'
      });

      expect(result.response).to.equal(expected);
      expect(complete).to.be.true;
    });

    it('should emit progress event when progressSubscriber is specified', function() {
      const spy = sinon.spy();
      const progressSubscriber = (<any>{
        next: spy,
        error: () => {
          // noop
        },
        complete: () => {
          // noop
        }
      });

      Rx.Observable.ajax({
        url: '/flibbertyJibbet',
        progressSubscriber
      })
        .subscribe();

      const request = MockXMLHttpRequest.mostRecent;

      request.respondWith({
        'status': 200,
        'contentType': 'application/json',
        'responseText': JSON.stringify({})
      }, 3);

      expect(spy).to.be.calledThrice;
    });

    it('should emit progress event when progressSubscriber is specified in IE', function() {
      const spy = sinon.spy();
      const progressSubscriber = (<any>{
        next: spy,
        error: () => {
          // noop
        },
        complete: () => {
          // noop
        }
      });

      root.XMLHttpRequest = MockXMLHttpRequestInternetExplorer;
      root.XDomainRequest = MockXMLHttpRequestInternetExplorer;

      Rx.Observable.ajax({
        url: '/flibbertyJibbet',
        progressSubscriber
      })
        .subscribe();

      const request = MockXMLHttpRequest.mostRecent;

      request.respondWith({
        'status': 200,
        'contentType': 'application/json',
        'responseText': JSON.stringify({})
      }, 3);

      expect(spy.callCount).to.equal(3);
    });

  });

  it('should work fine when XMLHttpRequest onreadystatechange property is monkey patched', function() {
    Object.defineProperty(root.XMLHttpRequest.prototype, 'onreadystatechange', {
      set: function (fn: (e: ProgressEvent) => any) {
        const wrapFn = (ev: ProgressEvent) => {
          const result = fn.call(this, ev);
          if (result === false) {
            ev.preventDefault();
          }
        };
        this['_onreadystatechange'] = wrapFn;
      },
      get() {
        return this['_onreadystatechange'];
      },
      configurable: true
    });

    Rx.Observable.ajax({
      url: '/flibbertyJibbet'
    })
      .subscribe();

    const request = MockXMLHttpRequest.mostRecent;
    expect(() => {
      request.onreadystatechange((<any>'onreadystatechange'));
    }).not.throw();

    delete root.XMLHttpRequest.prototype.onreadystatechange;
  });

  it('should work fine when XMLHttpRequest ontimeout property is monkey patched', function() {
    Object.defineProperty(root.XMLHttpRequest.prototype, 'ontimeout', {
      set: function (fn: (e: ProgressEvent) => any) {
        const wrapFn = (ev: ProgressEvent) => {
          const result = fn.call(this, ev);
          if (result === false) {
            ev.preventDefault();
          }
        };
        this['_ontimeout'] = wrapFn;
      },
      get() {
        return this['_ontimeout'];
      },
      configurable: true
    });

    const ajaxRequest = {
      url: '/flibbertyJibbet'
    };

    Rx.Observable.ajax(ajaxRequest)
      .subscribe();

    const request = MockXMLHttpRequest.mostRecent;
    try {
      request.ontimeout((<any>'ontimeout'));
    } catch (e) {
      expect(e.message).to.equal(new Rx.AjaxTimeoutError((<any>request), ajaxRequest).message);
    }
    delete root.XMLHttpRequest.prototype.ontimeout;
  });

  it('should work fine when XMLHttpRequest onprogress property is monkey patched', function() {
    Object.defineProperty(root.XMLHttpRequest.prototype, 'onprogress', {
      set: function (fn: (e: ProgressEvent) => any) {
        const wrapFn = (ev: ProgressEvent) => {
          const result = fn.call(this, ev);
          if (result === false) {
            ev.preventDefault();
          }
        };
        this['_onprogress'] = wrapFn;
      },
      get() {
        return this['_onprogress'];
      },
      configurable: true
    });

    Rx.Observable.ajax({
      url: '/flibbertyJibbet',
      progressSubscriber: (<any>{
        next: () => {
          // noop
        },
        error: () => {
          // noop
        },
        complete: () => {
          // noop
        }
      })
    })
      .subscribe();

    const request = MockXMLHttpRequest.mostRecent;

    expect(() => {
      request.upload.onprogress((<any>'onprogress'));
    }).not.throw();

    delete root.XMLHttpRequest.prototype.onprogress;
    delete root.XMLHttpRequest.prototype.upload;
  });

  it('should work fine when XMLHttpRequest onerror property is monkey patched', function() {
    Object.defineProperty(root.XMLHttpRequest.prototype, 'onerror', {
      set: function (fn: (e: ProgressEvent) => any) {
        const wrapFn = (ev: ProgressEvent) => {
          const result = fn.call(this, ev);
          if (result === false) {
            ev.preventDefault();
          }
        };
        this['_onerror'] = wrapFn;
      },
      get() {
        return this['_onerror'];
      },
      configurable: true
    });

    Rx.Observable.ajax({
      url: '/flibbertyJibbet'
    })
      .subscribe();

    const request = MockXMLHttpRequest.mostRecent;

    try {
      request.onerror((<any>'onerror'));
    } catch (e) {
      expect(e.message).to.equal('ajax error');
    }

    delete root.XMLHttpRequest.prototype.onerror;
    delete root.XMLHttpRequest.prototype.upload;
  });

  describe('ajax.patch', () => {
    it('should create an AjaxObservable with correct options', () => {
      const body = { foo: 'bar' };
      const headers = { first: 'first' };
      // returns Observable, not AjaxObservable, so needs a cast
      const { request } = <any>Rx.Observable
        .ajax.patch('/flibbertyJibbet', body, headers);

      expect(request.method).to.equal('PATCH');
      expect(request.url).to.equal('/flibbertyJibbet');
      expect(request.body).to.equal(body);
      expect(request.headers).to.equal(headers);
    });
  });
});

class MockXMLHttpRequest {
  private static requests: Array<MockXMLHttpRequest> = [];
  private static recentRequest: MockXMLHttpRequest;

  static get mostRecent(): MockXMLHttpRequest {
    return MockXMLHttpRequest.recentRequest;
  }

  static get allRequests(): Array<MockXMLHttpRequest> {
    return MockXMLHttpRequest.requests;
  }

  static clearRequest(): void {
    MockXMLHttpRequest.requests.length = 0;
    MockXMLHttpRequest.recentRequest = null;
  }

  private previousRequest: MockXMLHttpRequest;

  protected responseType: string = '';
  private eventHandlers: Array<any> = [];
  private readyState: number = 0;

  private user: any;
  private password: any;

  private responseHeaders: any;
  protected status: any;
  protected responseText: string;
  protected response: any;

  url: any;
  method: any;
  data: any;
  requestHeaders: any = {};
  withCredentials: boolean = false;

  onreadystatechange: (e: ProgressEvent) => any;
  onerror: (e: ErrorEvent) => any;
  onprogress: (e: ProgressEvent) => any;
  ontimeout: (e: ProgressEvent) => any;
  upload: XMLHttpRequestUpload = <any>{ };

  constructor() {
    this.previousRequest = MockXMLHttpRequest.recentRequest;
    MockXMLHttpRequest.recentRequest = this;
    MockXMLHttpRequest.requests.push(this);
  }

  send(data: any): void {
    this.data = data;
  }

  open(method: any, url: any, async: any, user: any, password: any): void {
    this.method = method;
    this.url = url;
    this.user = user;
    this.password = password;
    this.readyState = 1;
    this.triggerEvent('readyStateChange');
    const originalProgressHandler = this.upload.onprogress;
    Object.defineProperty(this.upload, 'progress', {
      get() {
        return originalProgressHandler;
      }
    });
  }

  setRequestHeader(key: any, value: any): void {
    this.requestHeaders[key] = value;
  }

  addEventListener(name: string, handler: any): void {
    this.eventHandlers.push({ name: name, handler: handler });
  }

  removeEventListener(name: string, handler: any): void {
    for (let i = this.eventHandlers.length - 1; i--; ) {
      let eh = this.eventHandlers[i];
      if (eh.name === name && eh.handler === handler) {
        this.eventHandlers.splice(i, 1);
      }
    }
  }

  throwError(err: any): void {
    // TODO: something better with errors
    this.triggerEvent('error');
  }

  protected jsonResponseValue(response: any) {
    try {
      this.response = JSON.parse(response.responseText);
    } catch (err) {
      throw new Error('unable to JSON.parse: \n' + response.responseText);
    }
  }

  protected defaultResponseValue() {
    throw new Error('unhandled type "' + this.responseType + '"');
  }

  respondWith(response: any, progressTimes?: number): void {
    if (progressTimes) {
      for (let i = 1; i <= progressTimes; ++ i) {
        this.triggerUploadEvent('progress', { type: 'ProgressEvent', total: progressTimes, loaded: i });
      }
    }
    this.readyState = 4;
    this.responseHeaders = {
      'Content-Type': response.contentType || 'text/plain'
    };
    this.status = response.status || 200;
    this.responseText = response.responseText;
    if (!('response' in response)) {
      switch (this.responseType) {
      case 'json':
        this.jsonResponseValue(response);
        break;
      case 'text':
        this.response = response.responseText;
        break;
      default:
        this.defaultResponseValue();
      }
    }
    // TODO: pass better event to onload.
    this.triggerEvent('load');
    this.triggerEvent('readystatechange');
  }

  triggerEvent(name: any, eventObj?: any): void {
    // TODO: create a better default event
    const e: any = eventObj || {};

    if (this['on' + name]) {
      this['on' + name](e);
    }

    this.eventHandlers.forEach(function (eh) {
      if (eh.name === name) {
        eh.handler.call(this, e);
      }
    });
  }

  triggerUploadEvent(name: any, eventObj?: any): void {
    // TODO: create a better default event
    const e: any = eventObj || {};

    if (this.upload['on' + name]) {
      this.upload['on' + name](e);
    }
  }
}

class MockXMLHttpRequestInternetExplorer extends MockXMLHttpRequest {

  private mockHttp204() {
    this.responseType = '';
    this.responseText = '';
    this.response = '';
  }

  protected jsonResponseValue(response: any) {
    if (this.status == 204) {
      this.mockHttp204();
      return;
    }
    return super.jsonResponseValue(response);
  }

  protected defaultResponseValue() {
    if (this.status == 204) {
      this.mockHttp204();
      return;
    }
    return super.defaultResponseValue();
  }

  triggerUploadEvent(name: any, eventObj?: any): void {
    // TODO: create a better default event
    const e: any = eventObj || {};
    if (this['on' + name]) {
      this['on' + name](e);
    }
  }
}
