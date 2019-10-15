import { ResponseType } from 'rxjs/ajax';

class MockXMLHttpRequestUpload {
  constructor(private mock: MockXMLHttpRequest) {}

  addEventListener(_event: 'progress', handler: Function) {
    this.mock.addEventListener('uploadProgress', handler);
  }

  removeEventListener(_event: 'progress', _handler: Function) {
    this.mock.removeEventListener('uploadProgress');
  }
}

class MockXMLHttpRequest {
  // Set by method calls.
  body: any;
  method: string;
  url: string;
  mockHeaders: { [key: string]: string } = {};
  mockAborted: boolean = false;

  // Directly settable interface.
  withCredentials: boolean = false;
  responseType = ResponseType.Text;

  // Mocked response interface.
  response: any | undefined = undefined;
  responseText: string | undefined = undefined;
  responseURL: string | null = null;
  status: number = 0;
  statusText: string = '';
  mockResponseHeaders: string = '';

  listeners: {
    error?: (event: ErrorEvent) => void;
    load?: () => void;
    progress?: (event: ProgressEvent) => void;
    uploadProgress?: (event: ProgressEvent) => void;
  } = {};

  upload = new MockXMLHttpRequestUpload(this);

  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
  }

  send(body: any): void {
    this.body = body;
  }

  addEventListener(event: 'error' | 'load' | 'progress' | 'uploadProgress', handler: Function): void {
    this.listeners[event] = handler as any;
  }

  removeEventListener(event: 'error' | 'load' | 'progress' | 'uploadProgress'): void {
    delete this.listeners[event];
  }

  setRequestHeader(name: string, value: string): void {
    this.mockHeaders[name] = value;
  }

  getAllResponseHeaders(): string {
    return this.mockResponseHeaders;
  }

  getResponseHeader(header: string): string | null {
    return this.mockResponseHeaders
      .split(`\n`)
      .map(x => x.split(':'))
      .find(([h]) => h === header)![1]
      .trim();
  }

  mockFlush(status: number, statusText: string, body?: string) {
    if (typeof body === 'string') {
      this.responseText = body;
    } else {
      this.response = body;
    }
    this.status = status;
    this.statusText = statusText;
    this.mockLoadEvent();
  }

  mockDownloadProgressEvent(loaded: number, total?: number): void {
    if (this.listeners.progress) {
      this.listeners.progress({ lengthComputable: total !== undefined, loaded, total } as any);
    }
  }

  mockUploadProgressEvent(loaded: number, total?: number) {
    if (this.listeners.uploadProgress) {
      this.listeners.uploadProgress({ lengthComputable: total !== undefined, loaded, total } as any);
    }
  }

  mockLoadEvent(): void {
    if (this.listeners.load) {
      this.listeners.load();
    }
  }

  mockErrorEvent(error: any): void {
    if (this.listeners.error) {
      this.listeners.error(error);
    }
  }

  abort() {
    this.mockAborted = true;
  }

  clear() {
    this.body = undefined;
    this.method = undefined as any;
    this.url = undefined as any;
    this.mockHeaders = {};
    this.mockAborted = false;
    this.withCredentials = false;
    this.responseType = ResponseType.Text;
    this.response = undefined;
    this.responseText = undefined;
    this.responseURL = null;
    this.status = 0;
    this.statusText = '';
    this.mockResponseHeaders = '';
    this.listeners = {};
    this.upload = new MockXMLHttpRequestUpload(this);
  }
}

export { MockXMLHttpRequestUpload, MockXMLHttpRequest };
