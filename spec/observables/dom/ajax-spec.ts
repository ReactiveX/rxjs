/** @prettier */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ajax, AjaxConfig, AjaxResponse, AjaxError, AjaxTimeoutError } from 'rxjs/ajax';
import { TestScheduler } from 'rxjs/testing';
import { noop } from 'rxjs';
import * as nodeFormData from 'form-data';



const root: any = (typeof globalThis !== 'undefined' && globalThis) || (typeof self !== 'undefined' && self) || global;

if (typeof root.FormData === 'undefined') {
  root.FormData = nodeFormData as any;  
}

/** @test {ajax} */
describe('ajax', () => {
  let rXHR: XMLHttpRequest;

  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    rXHR = root.XMLHttpRequest;
    root.XMLHttpRequest = MockXMLHttpRequest;
  });

  afterEach(() => {
    sandbox.restore();
    MockXMLHttpRequest.clearRequest();

    root.XMLHttpRequest = rXHR;
    root.XDomainRequest = null;
    root.ActiveXObject = null;
  });

  it('should create default XMLHttpRequest for non CORS', () => {
    const obj: AjaxConfig = {
      url: '/',
      method: '',
    };

    ajax(obj).subscribe();
    expect(MockXMLHttpRequest.mostRecent.withCredentials).to.be.false;
  });

  it('should raise an error if not able to create XMLHttpRequest', () => {
    root.XMLHttpRequest = null;
    root.ActiveXObject = null;

    const obj: AjaxConfig = {
      url: '/',
      method: '',
    };

    ajax(obj).subscribe(null, (err) => expect(err).to.exist);
  });

  it('should create XMLHttpRequest for CORS', () => {
    const obj: AjaxConfig = {
      url: '/',
      method: '',
      crossDomain: true,
      withCredentials: true,
    };

    ajax(obj).subscribe();
    expect(MockXMLHttpRequest.mostRecent.withCredentials).to.be.true;
  });

  it('should raise an error if not able to create CORS request', () => {
    root.XMLHttpRequest = null;
    root.XDomainRequest = null;

    const obj: AjaxConfig = {
      url: '/',
      method: '',
      crossDomain: true,
      withCredentials: true,
    };

    ajax(obj).subscribe(null, (err) => expect(err).to.exist);
  });

  it('should set headers', () => {
    const obj: AjaxConfig = {
      url: '/talk-to-me-goose',
      headers: {
        'Content-Type': 'kenny/loggins',
        'Fly-Into-The': 'Dangah Zone!',
        'Take-A-Ride-Into-The': 'Danger ZoooOoone!',
      },
      method: '',
    };

    ajax(obj).subscribe();

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.url).to.equal('/talk-to-me-goose');
    expect(request.requestHeaders).to.deep.equal({
      'content-type': 'kenny/loggins',
      'fly-into-the': 'Dangah Zone!',
      'take-a-ride-into-the': 'Danger ZoooOoone!',
      'x-requested-with': 'XMLHttpRequest',
    });
    // Did not mutate the headers passed
    expect(obj.headers).to.deep.equal({
      'Content-Type': 'kenny/loggins',
      'Fly-Into-The': 'Dangah Zone!',
      'Take-A-Ride-Into-The': 'Danger ZoooOoone!',
    });
  });

  describe('ajax XSRF cookie in custom header', () => {
    beforeEach(() => {
      (global as any).document = {
        cookie: 'foo=bar',
      } as Document;
    });

    afterEach(() => {
      delete (global as any).document; 
    });

    it('should send the cookie with a custom header to the same domain', () => {
      const obj: AjaxConfig = {
        url: '/some/path',
        xsrfCookieName: 'foo',
        xsrfHeaderName: 'Custom-Header-Name',
      };

      ajax(obj).subscribe();

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('/some/path');
      expect(request.requestHeaders).to.deep.equal({
        'Custom-Header-Name': 'bar',
        'x-requested-with': 'XMLHttpRequest',
      });
    });

    it('should send the cookie cross-domain with a custom header when withCredentials is set', () => {
      const obj: AjaxConfig = {
        url: 'https://some.subresouce.net/some/page',
        xsrfCookieName: 'foo',
        xsrfHeaderName: 'Custom-Header-Name',
        crossDomain: true,
        withCredentials: true,
      };

      ajax(obj).subscribe();

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('https://some.subresouce.net/some/page');
      expect(request.requestHeaders).to.deep.equal({
        'Custom-Header-Name': 'bar',
      });
    });

    it('should not send the cookie cross-domain with a custom header when withCredentials is not set', () => {
      const obj: AjaxConfig = {
        url: 'https://some.subresouce.net/some/page',
        xsrfCookieName: 'foo',
        xsrfHeaderName: 'Custom-Header-Name',
        crossDomain: true,
      };

      ajax(obj).subscribe();

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('https://some.subresouce.net/some/page');
      expect(request.requestHeaders).to.deep.equal({});
    });

    it('should not send the cookie if there is no xsrfHeaderName option', () => {
      const obj: AjaxConfig = {
        url: '/some/page',
        xsrfCookieName: 'foo',
      };

      ajax(obj).subscribe();

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('/some/page');
      expect(request.requestHeaders).to.deep.equal({
        'x-requested-with': 'XMLHttpRequest',
      });
    });
  });

  it('should set the X-Requested-With if crossDomain is false', () => {
    ajax({
      url: '/test/monkey',
      method: 'GET',
      crossDomain: false,
    }).subscribe();

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.requestHeaders).to.deep.equal({
      'x-requested-with': 'XMLHttpRequest',
    });
  });

  it('should not set default Content-Type header when no body is sent', () => {
    const obj: AjaxConfig = {
      url: '/talk-to-me-goose',
      method: 'GET',
    };

    ajax(obj).subscribe();

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
      },
    };

    ajax(<any>obj).subscribe(
      () => {
        throw 'should not next';
      },
      (err: any) => {
        error = err;
      },
      () => {
        throw 'should not complete';
      }
    );

    expect(error).to.be.an('error', 'wokka wokka');
  });

  it('should error if send request throws', (done: MochaDone) => {
    const expected = new Error('xhr send failure');

    ajax({
      url: '/flibbertyJibbet',
      responseType: 'text',
      method: '',
      createXHR: () => {
        const ret = new MockXMLHttpRequest();
        ret.send = () => {
          throw expected;
        };
        return ret as any;
      },
    }).subscribe(
      () => {
        done(new Error('should not be called'));
      },
      (e: Error) => {
        expect(e).to.be.equal(expected);
        done();
      },
      () => {
        done(new Error('should not be called'));
      }
    );
  });

  it('should succeed on 200', () => {
    const expected = { foo: 'bar' };
    let result: AjaxResponse<any>;
    let complete = false;

    ajax({
      url: '/flibbertyJibbet',
      responseType: 'text',
      method: '',
    }).subscribe(
      (x: any) => {
        result = x;
      },
      null,
      () => {
        complete = true;
      }
    );

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(expected),
    });

    expect(result!.xhr).exist;
    expect(result!.response).to.deep.equal(JSON.stringify({ foo: 'bar' }));
    expect(complete).to.be.true;
  });

  it('should fail if fails to parse response', () => {
    let error: any;
    const obj: AjaxConfig = {
      url: '/flibbertyJibbet',
      responseType: 'json',
      method: '',
    };

    ajax(obj).subscribe(
      () => {
        throw 'should not next';
      },
      (err: any) => {
        error = err;
      },
      () => {
        throw 'should not complete';
      }
    );

    MockXMLHttpRequest.mostRecent.respondWith({
      status: 207,
      contentType: '',
      responseType: '',
      responseText: 'Wee! I am text, but should be valid JSON!',
    });

    expect(error instanceof SyntaxError).to.be.true;
    expect(error.message).to.equal('Unexpected token W in JSON at position 0');
  });

  it('should fail on 404', () => {
    let error: any;
    const obj: AjaxConfig = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      method: '',
    };

    ajax(obj).subscribe(
      () => {
        throw 'should not next';
      },
      (err: any) => {
        error = err;
      },
      () => {
        throw 'should not complete';
      }
    );

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      status: 404,
      contentType: 'text/plain',
      responseText: 'Wee! I am text!',
    });

    expect(error instanceof AjaxError).to.be.true;
    expect(error.name).to.equal('AjaxError');
    expect(error.message).to.equal('ajax error 404');
    expect(error.status).to.equal(404);
  });

  it('should succeed on 300', () => {
    let result: AjaxResponse<any>;
    let complete = false;
    const obj: AjaxConfig = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      method: '',
    };

    ajax(obj).subscribe(
      (x: any) => {
        result = x;
      },
      null,
      () => {
        complete = true;
      }
    );

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      status: 300,
      contentType: 'text/plain',
      responseText: 'Wee! I am text!',
    });

    expect(result!.xhr).exist;
    expect(result!.response).to.deep.equal('Wee! I am text!');
    expect(complete).to.be.true;
  });

  it('should not fail if fails to parse error response', () => {
    let error: any;
    const obj: AjaxConfig = {
      url: '/flibbertyJibbet',
      responseType: 'json',
      method: '',
    };

    ajax(obj).subscribe(
      () => {
        throw 'should not next';
      },
      (err: any) => {
        error = err;
      },
      () => {
        throw 'should not complete';
      }
    );

    MockXMLHttpRequest.mostRecent.respondWith({
      status: 404,
      contentType: '',
      responseType: '',
      responseText: 'This is not what we expected is it? But that is okay',
    });

    expect(error instanceof AjaxError).to.be.true;
    expect(error.response).to.equal('This is not what we expected is it? But that is okay');
  });

  it('should succeed no settings', () => {
    const expected = JSON.stringify({ foo: 'bar' });

    ajax('/flibbertyJibbet').subscribe(
      (x: any) => {
        expect(x.status).to.equal(200);
        expect(x.xhr.method).to.equal('GET');
        expect(x.xhr.responseText).to.equal(expected);
      },
      () => {
        throw 'should not have been called';
      }
    );

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
    MockXMLHttpRequest.mostRecent.respondWith({
      status: 200,
      contentType: 'text/plain',
      responseText: expected,
    });
  });

  it('should fail no settings', () => {
    const expected = JSON.stringify({ foo: 'bar' });

    ajax('/flibbertyJibbet').subscribe(
      () => {
        throw 'should not have been called';
      },
      (x: any) => {
        expect(x.status).to.equal(500);
        expect(x.xhr.method).to.equal('GET');
        expect(x.xhr.responseText).to.equal(expected);
      },
      () => {
        throw 'should not have been called';
      }
    );

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
    MockXMLHttpRequest.mostRecent.respondWith({
      status: 500,
      contentType: 'text/plain',
      responseText: expected,
    });
  });

  it('should create an asynchronous request', () => {
    const obj: AjaxConfig = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      timeout: 10,
    };

    ajax(obj).subscribe(
      (x: any) => {
        expect(x.status).to.equal(200);
        expect(x.xhr.method).to.equal('GET');
        expect(x.xhr.async).to.equal(true);
        expect(x.xhr.timeout).to.equal(10);
        expect(x.xhr.responseType).to.equal('text');
      },
      () => {
        throw 'should not have been called';
      }
    );

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.url).to.equal('/flibbertyJibbet');

    request.respondWith({
      status: 200,
      contentType: 'text/plain',
      responseText: 'Wee! I am text!',
    });
  });

  it('should error on timeout of asynchronous request', () => {
    const rxTestScheduler = new TestScheduler(noop);

    const obj: AjaxConfig = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      timeout: 10,
    };

    ajax(obj).subscribe(
      () => {
        throw 'should not have been called';
      },
      (e) => {
        expect(e.status).to.equal(0);
        expect(e.xhr.method).to.equal('GET');
        expect(e.xhr.async).to.equal(true);
        expect(e.xhr.timeout).to.equal(10);
        expect(e.xhr.responseType).to.equal('text');
      }
    );

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.url).to.equal('/flibbertyJibbet');

    rxTestScheduler.schedule(() => {
      request.respondWith({
        status: 200,
        contentType: 'text/plain',
        responseText: 'Wee! I am text!',
      });
    }, 1000);

    rxTestScheduler.flush();
  });

  it('should create a synchronous request', () => {
    const obj: AjaxConfig = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      timeout: 10,
      async: false,
    };

    ajax(obj).subscribe(
      (x: any) => {
        expect(x.status).to.equal(200);
        expect(x.xhr.method).to.equal('GET');
        expect(x.xhr.async).to.equal(false);
        expect(x.xhr.timeout).to.be.undefined;
        expect(x.xhr.responseType).to.equal('');
      },
      () => {
        throw 'should not have been called';
      }
    );

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.url).to.equal('/flibbertyJibbet');

    request.respondWith({
      status: 200,
      contentType: 'text/plain',
      responseText: 'Wee! I am text!',
    });
  });

  describe('ajax request body', () => {
    it('can take string body', () => {
      const obj = {
        url: '/flibbertyJibbet',
        method: 'POST',
        body: 'foobar',
      };

      ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal('foobar');
    });

    it('can take FormData body', () => {
      const body = new root.FormData();
      const obj = {
        url: '/flibbertyJibbet',
        method: 'POST',
        body: body,
      };

      ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal(body);
      expect(MockXMLHttpRequest.mostRecent.requestHeaders).to.deep.equal({
        'x-requested-with': 'XMLHttpRequest',
      });
    });

    it('should send the URLSearchParams straight through to the body', () => {
      const body = new URLSearchParams({
        '🌟': '🚀',
      });
      const obj = {
        url: '/flibbertyJibbet',
        method: 'POST',
        body: body,
      };

      ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal(body);
    });

    it('should send by JSON', () => {
      const body = {
        '🌟': '🚀',
      };
      const obj = {
        url: '/flibbertyJibbet',
        method: 'POST',
        body: body,
      };

      ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal('{"🌟":"🚀"}');
    });

    it('should send json body not mattered on case-sensitivity of HTTP headers', () => {
      const body = {
        hello: 'world',
      };

      const requestObj = {
        url: '/flibbertyJibbet',
        method: '',
        body: body,
        headers: {
          'cOnTeNt-TyPe': 'application/json;charset=UTF-8',
        },
      };

      ajax(requestObj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal('{"hello":"world"}');
    });

    it('should error if send request throws', (done: MochaDone) => {
      const expected = new Error('xhr send failure');

      const obj: AjaxConfig = {
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
        },
      };

      ajax(obj).subscribe(
        () => {
          done(new Error('should not be called'));
        },
        (e: Error) => {
          expect(e).to.be.equal(expected);
          done();
        },
        () => {
          done(new Error('should not be called'));
        }
      );
    });
  });

  describe('ajax.get', () => {
    it('should succeed on 200', () => {
      const expected = { foo: 'bar' };
      let result;
      let complete = false;

      ajax.get('/flibbertyJibbet').subscribe(
        (x) => {
          result = x.response;
        },
        null,
        () => {
          complete = true;
        }
      );

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('/flibbertyJibbet');

      request.respondWith({
        status: 200,
        contentType: 'application/json',
        responseText: JSON.stringify(expected),
      });

      expect(result).to.deep.equal(expected);
      expect(complete).to.be.true;
    });

    it('should succeed on 204 No Content', () => {
      const expected: null = null;
      let result;
      let complete = false;

      ajax.get('/flibbertyJibbet').subscribe(
        (x) => {
          result = x.response;
        },
        null,
        () => {
          complete = true;
        }
      );

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('/flibbertyJibbet');

      request.respondWith({
        status: 204,
        contentType: 'application/json',
        responseText: expected,
      });

      expect(result).to.deep.equal(expected);
      expect(complete).to.be.true;
    });

    it('should able to select json response via getJSON', () => {
      const expected = { foo: 'bar' };
      let result;
      let complete = false;

      ajax.getJSON('/flibbertyJibbet').subscribe(
        (x) => {
          result = x;
        },
        null,
        () => {
          complete = true;
        }
      );

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.url).to.equal('/flibbertyJibbet');

      request.respondWith({
        status: 200,
        contentType: 'application/json',
        responseText: JSON.stringify(expected),
      });

      expect(result).to.deep.equal(expected);
      expect(complete).to.be.true;
    });
  });

  describe('ajax.post', () => {
    it('should succeed on 200', () => {
      const expected = { foo: 'bar', hi: 'there you' };
      let result: AjaxResponse<any>;
      let complete = false;

      ajax.post('/flibbertyJibbet', expected).subscribe(
        (x) => {
          result = x;
        },
        null,
        () => {
          complete = true;
        }
      );

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.method).to.equal('POST');
      expect(request.url).to.equal('/flibbertyJibbet');
      expect(request.requestHeaders).to.deep.equal({
        'content-type': 'application/json;charset=utf-8',
        'x-requested-with': 'XMLHttpRequest',
      });

      request.respondWith({
        status: 200,
        contentType: 'application/json',
        responseText: JSON.stringify(expected),
      });

      expect(request.data).to.equal(JSON.stringify(expected));
      expect(result!.response).to.deep.equal(expected);
      expect(complete).to.be.true;
    });

    it('should succeed on 204 No Content', () => {
      const expected: null = null;
      let result: AjaxResponse<any>;
      let complete = false;

      ajax.post('/flibbertyJibbet', expected).subscribe(
        (x) => {
          result = x;
        },
        null,
        () => {
          complete = true;
        }
      );

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.method).to.equal('POST');
      expect(request.url).to.equal('/flibbertyJibbet');
      expect(request.requestHeaders).to.deep.equal({
        'x-requested-with': 'XMLHttpRequest',
      });

      request.respondWith({
        status: 204,
        contentType: 'application/json',
        responseType: 'json',
        responseText: expected,
      });

      expect(result!.response).to.equal(expected);
      expect(complete).to.be.true;
    });

    it('should allow partial progressSubscriber ', function () {
      const spy = sinon.spy();
      const progressSubscriber: any = {
        next: spy,
      };

      ajax({
        url: '/flibbertyJibbet',
        progressSubscriber,
      }).subscribe();

      const request = MockXMLHttpRequest.mostRecent;

      request.respondWith(
        {
          status: 200,
          contentType: 'application/json',
          responseText: JSON.stringify({}),
        },
        3
      );

      expect(spy).to.be.calledThrice;
    });

    it('should emit progress event when progressSubscriber is specified', function () {
      const spy = sinon.spy();
      const progressSubscriber = <any>{
        next: spy,
        error: () => {
          // noop
        },
        complete: () => {
          // noop
        },
      };

      ajax({
        url: '/flibbertyJibbet',
        progressSubscriber,
      }).subscribe();

      const request = MockXMLHttpRequest.mostRecent;

      request.respondWith(
        {
          status: 200,
          contentType: 'application/json',
          responseText: JSON.stringify({}),
        },
        3
      );

      expect(spy).to.be.calledThrice;
    });
  });

  it('should work fine when XMLHttpRequest ontimeout property is monkey patched', function (done) {
    Object.defineProperty(root.XMLHttpRequest.prototype, 'ontimeout', {
      set(fn: (e: ProgressEvent) => any) {
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
      configurable: true,
    });

    const ajaxRequest: AjaxConfig = {
      url: '/flibbertyJibbet',
    };

    ajax(ajaxRequest).subscribe({
      error(err) {
        expect(err.name).to.equal('AjaxTimeoutError');
        done();
      },
    });

    const request = MockXMLHttpRequest.mostRecent;
    try {
      request.ontimeout('ontimeout' as any);
    } catch (e) {
      expect(e.message).to.equal(new AjaxTimeoutError(request as any, {
        url: ajaxRequest.url,
        method: 'GET',
        headers: {
          'content-type': 'application/json;encoding=Utf-8',
        },
        withCredentials: false,
        async: true,
        timeout: 0,
        crossDomain: false,
        responseType: 'json'
      }).message);
    }
    delete root.XMLHttpRequest.prototype.ontimeout;
  });

  it('should work fine when XMLHttpRequest onprogress property is monkey patched', function () {
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
      configurable: true,
    });

    ajax({
      url: '/flibbertyJibbet',
      progressSubscriber: <any>{
        next: () => {
          // noop
        },
        error: () => {
          // noop
        },
        complete: () => {
          // noop
        },
      },
    }).subscribe();

    const request = MockXMLHttpRequest.mostRecent;

    expect(() => {
      (request.upload as any).onprogress(<any>'onprogress');
    }).not.throw();

    delete root.XMLHttpRequest.prototype.onprogress;
    delete root.XMLHttpRequest.prototype.upload;
  });

  it('should work fine when XMLHttpRequest onerror property is monkey patched', function () {
    Object.defineProperty(root.XMLHttpRequest.prototype, 'onerror', {
      set(fn: (e: ProgressEvent) => any) {
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
      configurable: true,
    });

    ajax({
      url: '/flibbertyJibbet',
    }).subscribe({
      error() {
        /* expected */
      },
    });

    const request = MockXMLHttpRequest.mostRecent;

    try {
      request.onerror(<any>'onerror');
    } catch (e) {
      expect(e.message).to.equal('ajax error');
    }

    delete root.XMLHttpRequest.prototype.onerror;
    delete root.XMLHttpRequest.prototype.upload;
  });

  describe('ajax.patch', () => {
    it('should create an AjaxObservable with correct options', () => {
      const expected = { foo: 'bar', hi: 'there you' };
      let result: AjaxResponse<any>;
      let complete = false;

      ajax.patch('/flibbertyJibbet', expected).subscribe(
        (x) => {
          result = x;
        },
        null,
        () => {
          complete = true;
        }
      );

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.method).to.equal('PATCH');
      expect(request.url).to.equal('/flibbertyJibbet');
      expect(request.requestHeaders).to.deep.equal({
        'content-type': 'application/json;charset=utf-8',
        'x-requested-with': 'XMLHttpRequest',
      });

      request.respondWith({
        status: 200,
        contentType: 'application/json',
        responseText: JSON.stringify(expected),
      });

      expect(request.data).to.equal(JSON.stringify(expected));
      expect(result!.response).to.deep.equal(expected);
      expect(complete).to.be.true;
    });
  });

  describe('ajax error classes', () => {
    describe('AjaxError', () => {
      it('should extend Error class', () => {
        const error = new AjaxError('Test error', new XMLHttpRequest(), {
          url: '/',
          method: 'GET',
          responseType: 'json',
          headers: {},
          withCredentials: false,
          async: true,
          timeout: 0,
          crossDomain: false,
        });
        expect(error).to.be.an.instanceOf(Error);
      });
    });

    describe('AjaxTimeoutError', () => {
      it('should extend Error class', () => {
        const error = new AjaxTimeoutError(new XMLHttpRequest(), {
          url: '/',
          method: 'GET',
          responseType: 'json',
          headers: {},
          withCredentials: false,
          async: true,
          timeout: 0,
          crossDomain: false,
        });
        expect(error).to.be.an.instanceOf(Error);
      });

      it('should extend AjaxError class', () => {
        const error = new AjaxTimeoutError(new XMLHttpRequest(), {
          url: '/',
          method: 'GET',
          responseType: 'json',
          headers: {},
          withCredentials: false,
          async: true,
          timeout: 0,
          crossDomain: false,
        });
        expect(error).to.be.an.instanceOf(AjaxError);
      });
    });
  });
});

class MockXMLHttpRequest {
  public static readonly DONE = 4;
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
    MockXMLHttpRequest.recentRequest = null!;
  }

  protected responseType: string = '';
  private readyState: number = 0;

  private async: boolean = true;

  protected status: any;
  // @ts-ignore: Property has no initializer and is not definitely assigned
  protected responseText: string;
  protected response: any;

  url: any;
  method: any;
  data: any;
  requestHeaders: any = {};
  withCredentials: boolean = false;

  // @ts-ignore: Property has no initializer and is not definitely assigned
  onreadystatechange: (e: ProgressEvent) => any;
  // @ts-ignore: Property has no initializer and is not definitely assigned
  onerror: (e: ErrorEvent) => any;
  // @ts-ignore: Property has no initializer and is not definitely assigned
  onprogress: (e: ProgressEvent) => any;
  // @ts-ignore: Property has no initializer and is not definitely assigned
  ontimeout: (e: ProgressEvent) => any;
  upload: XMLHttpRequestUpload = <any>{};

  constructor() {
    MockXMLHttpRequest.recentRequest = this;
    MockXMLHttpRequest.requests.push(this);
  }

  // @ts-ignore: Property has no initializer and is not definitely assigned
  timeout: number;

  send(data: any): void {
    this.data = data;
    if (this.timeout && this.timeout > 0) {
      setTimeout(() => {
        if (this.readyState != 4) {
          this.readyState = 4;
          this.status = 0;
          this.triggerEvent('readystatechange');
          this.triggerEvent('timeout');
        }
      }, this.timeout);
    }
  }

  abort() {
    // noop
  }

  open(method: any, url: any, async: any): void {
    this.method = method;
    this.url = url;
    this.async = async;
    this.readyState = 1;
    this.triggerEvent('readystatechange');
    const originalProgressHandler = this.upload.onprogress;
    Object.defineProperty(this.upload, 'progress', {
      get() {
        return originalProgressHandler;
      },
    });
  }

  setRequestHeader(key: any, value: any): void {
    this.requestHeaders[key] = value;
  }

  protected jsonResponseValue(response: any) {
    try {
      this.response = JSON.parse(response.responseText);
    } catch (err) {
      throw new Error('unable to JSON.parse: \n' + response.responseText);
    }
  }

  protected defaultResponseValue() {
    if (this.async === false) {
      this.response = this.responseText;
    }
  }

  respondWith(response: any, progressTimes?: number): void {
    if (progressTimes) {
      for (let i = 1; i <= progressTimes; ++i) {
        this.triggerUploadEvent('progress', { type: 'ProgressEvent', total: progressTimes, loaded: i });
      }
    }
    this.readyState = 4;
    this.status = response.status || 200;
    this.responseText = response.responseText;
    const responseType = response.responseType !== undefined ? response.responseType : this.responseType;
    if (!('response' in response)) {
      switch (responseType) {
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

  triggerEvent(this: any, name: any, eventObj?: any): void {
    // TODO: create a better default event
    const e: any = eventObj || { type: name };

    if (this['on' + name]) {
      this['on' + name](e);
    }
  }

  triggerUploadEvent(this: any, name: any, eventObj?: any): void {
    // TODO: create a better default event
    const e: any = eventObj || {};

    if (this.upload['on' + name]) {
      this.upload['on' + name](e);
    }
  }
}
