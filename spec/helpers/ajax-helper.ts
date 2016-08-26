declare const __root__: any;

export class MockWebSocket {
  static sockets: Array<MockWebSocket> = [];
  static get lastSocket(): MockWebSocket {
    const socket = MockWebSocket.sockets;
    const length = socket.length;
    return length > 0 ? socket[length - 1] : undefined;
  }

  static clearSockets(): void {
    MockWebSocket.sockets.length = 0;
  }

  sent: Array<any> = [];
  handlers: any = {};
  readyState: number = 0;
  closeCode: any;
  closeReason: any;

  constructor(public url: string, public protocol: string) {
    MockWebSocket.sockets.push(this);
  }

  send(data: any): void {
    this.sent.push(data);
  }

  get lastMessageSent(): any {
    const sent = this.sent;
    const length = sent.length;

    return length > 0 ? sent[length - 1] : undefined;
  }

  triggerClose(e: any): void {
    this.readyState = 3;
    this.trigger('close', e);
  }

  triggerError(err: any): void {
    this.readyState = 3;
    this.trigger('error', err);
  }

  triggerMessage(data: any): void {
    const messageEvent = {
      data: data,
      origin: 'mockorigin',
      ports: undefined,
      source: __root__,
    };

    this.trigger('message', messageEvent);
  }

  open(): void {
    this.readyState = 1;
    this.trigger('open', {});
  }

  close(code: any, reason: any): void {
    if (this.readyState < 2) {
      this.readyState = 2;
      this.closeCode = code;
      this.closeReason = reason;
      this.triggerClose({ wasClean: true });
    }
  }

  addEventListener(name: string, handler: any): void {
    const lookup = this.handlers[name] = this.handlers[name] || [];
    lookup.push(handler);
  }

  removeEventListener(name: string, handler: any): void {
    const lookup = this.handlers[name];
    if (lookup) {
      for (let i = lookup.length - 1; i--; ) {
        if (lookup[i] === handler) {
          lookup.splice(i, 1);
        }
      }
    }
  }

  trigger(name: string, e: any) {
    if (this['on' + name]) {
      this['on' + name](e);
    }

    const lookup = this.handlers[name];
    if (lookup) {
      for (let i = 0; i < lookup.length; i++) {
        lookup[i](e);
      }
    }
  }
}

export class MockXMLHttpRequest {
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

  respondWith(response: any): void {
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
}

export class MockXMLHttpRequestInternetExplorer extends MockXMLHttpRequest {
  constructor() {
    super();
  }

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

}
