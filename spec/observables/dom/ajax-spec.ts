import { expect } from 'chai';
import * as sinon from 'sinon';
import { root } from 'rxjs/util/root';
import { TestScheduler } from 'rxjs/testing';
import { ajax, AjaxRequest, AjaxResponse, AjaxError, AjaxTimeoutError } from 'rxjs/ajax';

declare const global: any;
declare const rxTestScheduler: TestScheduler;

/** @test {ajax} */
describe('ajax', () => {
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
    const obj: AjaxRequest = {
      url: '/',
      method: ''
    };

    ajax(obj).subscribe();
    expect(MockXMLHttpRequest.mostRecent.withCredentials).to.be.false;
  });

  it('should try to create AXObject for XHR in old version of IE', () => {
    const axObjectStub = sandbox.stub();
    axObjectStub.returns(sinon.stub(new MockXMLHttpRequest()));
    root.ActiveXObject = axObjectStub;
    root.XMLHttpRequest = null;

    const obj: AjaxRequest = {
      url: '/',
      method: '',
      crossDomain: false,
    };

    ajax(obj).subscribe();
    expect(axObjectStub).to.have.been.called;
  });

  it('should raise an error if not able to create XMLHttpRequest', () => {
    root.XMLHttpRequest = null;
    root.ActiveXObject = null;

    const obj: AjaxRequest = {
      url: '/',
      method: ''
    };

    ajax(obj).subscribe(null, err => expect(err).to.exist);
  });

  it('should create XMLHttpRequest for CORS', () => {
    const obj: AjaxRequest = {
      url: '/',
      method: '',
      crossDomain: true,
      withCredentials: true
    };

    ajax(obj).subscribe();
    expect(MockXMLHttpRequest.mostRecent.withCredentials).to.be.true;
  });

  it('should try to create XDomainRequest for CORS if XMLHttpRequest is not available', () => {
    const xDomainStub = sandbox.stub();
    xDomainStub.returns(sinon.stub(new MockXMLHttpRequest()));
    root.XDomainRequest = xDomainStub;
    root.XMLHttpRequest = null;

    const obj: AjaxRequest = {
      url: '/',
      method: '',
      crossDomain: true,
      withCredentials: true
    };

    ajax(obj).subscribe();
    expect(xDomainStub).to.have.been.called;
  });

  it('should raise an error if not able to create CORS request', () => {
    root.XMLHttpRequest = null;
    root.XDomainRequest = null;

    const obj: AjaxRequest = {
      url: '/',
      method: '',
      crossDomain: true,
      withCredentials: true
    };

    ajax(obj).subscribe(null, err => expect(err).to.exist);
  });

  it('should set headers', () => {
    const obj: AjaxRequest = {
      url: '/talk-to-me-goose',
      headers: {
        'Content-Type': 'kenny/loggins',
        'Fly-Into-The': 'Dangah Zone!',
        'Take-A-Ride-Into-The': 'Danger ZoooOoone!'
      },
      method: ''
    };

    ajax(obj).subscribe();

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.url).to.equal('/talk-to-me-goose');
    expect(request.requestHeaders).to.deep.equal({
      'Content-Type': 'kenny/loggins',
      'Fly-Into-The': 'Dangah Zone!',
      'Take-A-Ride-Into-The': 'Danger ZoooOoone!',
    });
  });

  it('should set the X-Requested-With if crossDomain is false', () => {
    ajax({
      url: '/test/monkey',
      method: 'GET',
      crossDomain: false,
    })
    .subscribe();

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.requestHeaders).to.deep.equal({
      'X-Requested-With': 'XMLHttpRequest',
    });
  });

  it('should not set default Content-Type header when no body is sent', () => {
    const obj: AjaxRequest = {
      url: '/talk-to-me-goose',
      method: 'GET'
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
      }
    };

    ajax(<any>obj)
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

    ajax(obj)
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
    let result: AjaxResponse;
    let complete = false;
    const obj = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      method: ''
    };

    ajax(obj)
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

  it('should fail if fails to parse response', () => {
    let error: any;
    const obj = {
      url: '/flibbertyJibbet',
      responseType: 'json',
      method: ''
    };

    ajax(obj)
      .subscribe((x: any) => {
        throw 'should not next';
      }, (err: any) => {
        error = err;
      }, () => {
        throw 'should not complete';
      });

    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 207,
      'contentType': '',
      'responseType': '',
      'responseText': 'Wee! I am text, but should be valid JSON!'
    });

    expect(error instanceof SyntaxError).to.be.true;
    expect(error.message).to.equal('Unexpected token W in JSON at position 0');
  });

  it('should fail on 404', () => {
    let error: any;
    const obj = {
      url: '/flibbertyJibbet',
      normalizeError: (e: any, xhr: any, type: any) => {
        return xhr.response || xhr.responseText;
      },
      responseType: 'text',
      method: ''
    };

    ajax(obj)
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

    expect(error instanceof AjaxError).to.be.true;
    expect(error.name).to.equal('AjaxError');
    expect(error.message).to.equal('ajax error 404');
    expect(error.status).to.equal(404);
  });

  it('should succeed on 300', () => {
    let result: AjaxResponse;
    let complete = false;
    const obj = {
      url: '/flibbertyJibbet',
      normalizeError: (e: any, xhr: any, type: any) => {
        return xhr.response || xhr.responseText;
      },
      responseType: 'text',
      method: ''
    };

    ajax(obj)
      .subscribe((x: any) => {
        result = x;
      }, null, () => {
        complete = true;
      });

    expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');

    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 300,
      'contentType': 'text/plain',
      'responseText': 'Wee! I am text!'
    });

    expect(result.xhr).exist;
    expect(result.response).to.deep.equal('Wee! I am text!');
    expect(complete).to.be.true;
  });

  it('should fail if fails to parse error response', () => {
    let error: any;
    const obj = {
      url: '/flibbertyJibbet',
      normalizeError: (e: any, xhr: any, type: any) => {
        return xhr.response || xhr.responseText;
      },
      responseType: 'json',
      method: ''
    };

    ajax(obj).subscribe(x => {
      throw 'should not next';
    }, (err: any) => {
      error = err;
    }, () => {
      throw 'should not complete';
    });

    MockXMLHttpRequest.mostRecent.respondWith({
      'status': 404,
      'contentType': '',
      'responseType': '',
      'responseText': 'Wee! I am text, but should be valid JSON!'
    });

    expect(error instanceof SyntaxError).to.be.true;
    expect(error.message).to.equal('Unexpected token W in JSON at position 0');
  });

  it('should succeed no settings', () => {
    const expected = JSON.stringify({ foo: 'bar' });

    ajax('/flibbertyJibbet')
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

    ajax('/flibbertyJibbet')
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

  it('should create an asynchronous request', () => {
    const obj: AjaxRequest = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      timeout: 10
    };

    ajax(obj)
      .subscribe((x: any) => {
        expect(x.status).to.equal(200);
        expect(x.xhr.method).to.equal('GET');
        expect(x.xhr.async).to.equal(true);
        expect(x.xhr.timeout).to.equal(10);
        expect(x.xhr.responseType).to.equal('text');
      }, () => {
        throw 'should not have been called';
      });

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.url).to.equal('/flibbertyJibbet');

    request.respondWith({
      'status': 200,
      'contentType': 'text/plain',
      'responseText': 'Wee! I am text!'
    });
  });

  it('should error on timeout of asynchronous request', () => {
    const obj: AjaxRequest = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      timeout: 10
    };

    ajax(obj)
      .subscribe((x: any) => {
        throw 'should not have been called';
      }, (e) => {
        expect(e.status).to.equal(0);
        expect(e.xhr.method).to.equal('GET');
        expect(e.xhr.async).to.equal(true);
        expect(e.xhr.timeout).to.equal(10);
        expect(e.xhr.responseType).to.equal('text');
      });

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.url).to.equal('/flibbertyJibbet');

    rxTestScheduler.schedule(() => {
      request.respondWith({
        'status': 200,
        'contentType': 'text/plain',
        'responseText': 'Wee! I am text!'
      });
    }, 1000);

    rxTestScheduler.flush();
  });

  it('should create a synchronous request', () => {
    const obj: AjaxRequest = {
      url: '/flibbertyJibbet',
      responseType: 'text',
      timeout: 10,
      async: false
    };

    ajax(obj)
      .subscribe((x: any) => {
        expect(x.status).to.equal(200);
        expect(x.xhr.method).to.equal('GET');
        expect(x.xhr.async).to.equal(false);
        expect(x.xhr.timeout).to.be.undefined;
        expect(x.xhr.responseType).to.equal('');
      }, () => {
        throw 'should not have been called';
      });

    const request = MockXMLHttpRequest.mostRecent;

    expect(request.url).to.equal('/flibbertyJibbet');

    request.respondWith({
      'status': 200,
      'contentType': 'text/plain',
      'responseText': 'Wee! I am text!'
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

      ajax(obj).subscribe();

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

      ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.deep.equal(body);
      expect(MockXMLHttpRequest.mostRecent.requestHeaders).to.deep.equal({
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

      ajax(obj).subscribe();

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

      ajax(obj).subscribe();

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

      ajax(obj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal('{"🌟":"🚀"}');
    });

    it('should send json body not mattered on case-sensitivity of HTTP headers', () => {
      const body = {
        hello: 'world'
      };

      const requestObj = {
        url: '/flibbertyJibbet',
        method: '',
        body: body,
        headers: {
          'cOnTeNt-TyPe': 'application/json; charset=UTF-8'
        }
      };

      ajax(requestObj).subscribe();

      expect(MockXMLHttpRequest.mostRecent.url).to.equal('/flibbertyJibbet');
      expect(MockXMLHttpRequest.mostRecent.data).to.equal('{"hello":"world"}');
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

      ajax(obj)
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

      ajax.get('/flibbertyJibbet')
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
      const expected: null = null;
      let result;
      let complete = false;

      ajax.get('/flibbertyJibbet')
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

      ajax.getJSON('/flibbertyJibbet')
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
      let result: AjaxResponse;
      let complete = false;

      ajax.post('/flibbertyJibbet', expected)
        .subscribe(x => {
          result = x;
        }, null, () => {
          complete = true;
        });

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.method).to.equal('POST');
      expect(request.url).to.equal('/flibbertyJibbet');
      expect(request.requestHeaders).to.deep.equal({
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

    it('should properly encode full URLs passed', () => {
      const expected = { test: 'https://google.com/search?q=encodeURI+vs+encodeURIComponent' };
      let result: AjaxResponse;
      let complete = false;

      ajax.post('/flibbertyJibbet', expected)
        .subscribe(x => {
          result = x;
        }, null, () => {
          complete = true;
        });

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.method).to.equal('POST');
      expect(request.url).to.equal('/flibbertyJibbet');
      expect(request.requestHeaders).to.deep.equal({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      });

      request.respondWith({
        'status': 200,
        'contentType': 'application/json',
        'responseText': JSON.stringify(expected)
      });

      expect(request.data)
        .to.equal('test=https%3A%2F%2Fgoogle.com%2Fsearch%3Fq%3DencodeURI%2Bvs%2BencodeURIComponent');
      expect(result.response).to.deep.equal(expected);
      expect(complete).to.be.true;
    });

    it('should succeed on 204 No Content', () => {
      const expected: null = null;
      let result: AjaxResponse;
      let complete = false;

      ajax.post('/flibbertyJibbet', expected)
        .subscribe(x => {
          result = x;
        }, null, () => {
          complete = true;
        });

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.method).to.equal('POST');
      expect(request.url).to.equal('/flibbertyJibbet');
      expect(request.requestHeaders).to.deep.equal({
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
      const expected: null = null;
      let result: AjaxResponse;
      let complete = false;

      root.XMLHttpRequest = MockXMLHttpRequestInternetExplorer;

      ajax.post('/flibbertyJibbet', expected)
        .subscribe(x => {
          result = x;
        }, null, () => {
          complete = true;
        });

      const request = MockXMLHttpRequest.mostRecent;

      expect(request.method).to.equal('POST');
      expect(request.url).to.equal('/flibbertyJibbet');
      expect(request.requestHeaders).to.deep.equal({
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

      ajax({
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

      ajax({
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

    ajax({
      url: '/flibbertyJibbet'
    })
      .subscribe();

    const request = MockXMLHttpRequest.mostRecent;
    expect(() => {
      request.onreadystatechange((<any>'onreadystatechange'));
    }).not.throw();

    delete root.XMLHttpRequest.prototype.onreadystatechange;
  });

  it('should work fine when XMLHttpRequest ontimeout property is monkey patched', function(done) {
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
      configurable: true
    });

    const ajaxRequest = {
      url: '/flibbertyJibbet'
    };

    ajax(ajaxRequest)
      .subscribe({
        error(err) {
          expect(err.name).to.equal('AjaxTimeoutError');
          done();
        }
      });

    const request = MockXMLHttpRequest.mostRecent;
    try {
      request.ontimeout((<any>'ontimeout'));
    } catch (e) {
      expect(e.message).to.equal(new AjaxTimeoutError((<any>request), ajaxRequest).message);
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

    ajax({
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
      (request.upload as any).onprogress((<any>'onprogress'));
    }).not.throw();

    delete root.XMLHttpRequest.prototype.onprogress;
    delete root.XMLHttpRequest.prototype.upload;
  });

  it('should work fine when XMLHttpRequest onerror property is monkey patched', function() {
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
      configurable: true
    });

    ajax({
      url: '/flibbertyJibbet'
    })
      .subscribe({
        error(err) {
          /* expected */
        }
      });

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
      const { request } = <any>ajax.patch('/flibbertyJibbet', body, headers);

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

  private async: boolean = true;

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

  open(method: any, url: any, async: any, user: any, password: any): void {
    this.method = method;
    this.url = url;
    this.async = async;
    this.user = user;
    this.password = password;
    this.readyState = 1;
    this.triggerEvent('readystatechange');
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

  triggerEvent(name: any, eventObj?: any): void {
    // TODO: create a better default event
    const e: any = eventObj || { type: name };

    if (this['on' + name]) {
      this['on' + name](e);
    }
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
