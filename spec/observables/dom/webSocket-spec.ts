import { expect } from 'chai';
import * as sinon from 'sinon';
import * as Rx from '../../../dist/package/Rx';

declare const __root__: any;

const Observable = Rx.Observable;

/** @test {webSocket} */
describe('Observable.webSocket', () => {
  let __ws: any;

  function setupMockWebSocket() {
    MockWebSocket.clearSockets();
    __ws = __root__.WebSocket;
    __root__.WebSocket = MockWebSocket;
  }

  function teardownMockWebSocket() {
    __root__.WebSocket = __ws;
    MockWebSocket.clearSockets();
  }

  beforeEach(() => {
    setupMockWebSocket();
  });

  afterEach(() => {
    teardownMockWebSocket();
  });

  it('should send and receive messages', () => {
    let messageReceived = false;
    const subject = Observable.webSocket('ws://mysocket');

    subject.next('ping');

    subject.subscribe((x: string) => {
      expect(x).to.equal('pong');
      messageReceived = true;
    });

    const socket = MockWebSocket.lastSocket;
    expect(socket.url).to.equal('ws://mysocket');

    socket.open();
    expect(socket.lastMessageSent).to.equal('ping');

    socket.triggerMessage(JSON.stringify('pong'));
    expect(messageReceived).to.be.true;

    subject.unsubscribe();
  });

  it('should allow the user to chain operators', () => {
    let messageReceived = false;
    const subject = Observable.webSocket('ws://mysocket');

    subject
      .map(x => x + '?')
      .map(x => x + '!')
      .map(x => x + '!')
      .subscribe((x: string) => {
        expect(x).to.equal('pong?!!');
        messageReceived = true;
      });

    const socket = MockWebSocket.lastSocket;

    socket.open();

    socket.triggerMessage(JSON.stringify('pong'));
    expect(messageReceived).to.be.true;

    subject.unsubscribe();
  });

  it('receive multiple messages', () => {
    const expected = ['what', 'do', 'you', 'do', 'with', 'a', 'drunken', 'sailor?'];
    const results = [];
    const subject = Observable.webSocket('ws://mysocket');

    subject.subscribe((x: string) => {
      results.push(x);
    });

    const socket = MockWebSocket.lastSocket;

    socket.open();

    expected.forEach((x: string) => {
      socket.triggerMessage(JSON.stringify(x));
    });

    expect(results).to.deep.equal(expected);

    subject.unsubscribe();
  });

  it('should queue messages prior to subscription', () => {
    const expected = ['make', 'him', 'walk', 'the', 'plank'];
    const subject = Observable.webSocket('ws://mysocket');

    expected.forEach((x: string) => {
      subject.next(x);
    });

    let socket = MockWebSocket.lastSocket;
    expect(socket).not.exist;

    subject.subscribe();

    socket = MockWebSocket.lastSocket;
    expect(socket.sent.length).to.equal(0);

    socket.open();
    expect(socket.sent.length).to.equal(expected.length);

    subject.unsubscribe();
  });

  it('should send messages immediately if already open', () => {
    const subject = Observable.webSocket('ws://mysocket');
    subject.subscribe();
    const socket = MockWebSocket.lastSocket;
    socket.open();

    subject.next('avast!');
    expect(socket.lastMessageSent).to.equal('avast!');
    subject.next('ye swab!');
    expect(socket.lastMessageSent).to.equal('ye swab!');

    subject.unsubscribe();
  });

  it('should close the socket when completed', () => {
    const subject = Observable.webSocket('ws://mysocket');
    subject.subscribe();
    const socket = MockWebSocket.lastSocket;
    socket.open();

    expect(socket.readyState).to.equal(1); // open

    sinon.spy(socket, 'close');

    expect(socket.close).not.have.been.called;

    subject.complete();
    expect(socket.close).have.been.called;
    expect(socket.readyState).to.equal(3); // closed

    subject.unsubscribe();
    (<any>socket.close).restore();
  });

  it('should close the socket with a code and a reason when errored', () => {
    const subject = Observable.webSocket('ws://mysocket');
    subject.subscribe();
    const socket = MockWebSocket.lastSocket;
    socket.open();

    sinon.spy(socket, 'close');
    expect(socket.close).not.have.been.called;

    subject.error({ code: 1337, reason: 'Too bad, so sad :('});
    expect(socket.close).have.been.calledWith(1337, 'Too bad, so sad :(');

    subject.unsubscribe();
    (<any>socket.close).restore();
  });

  it('should allow resubscription after closure via complete', () => {
    const subject = Observable.webSocket('ws://mysocket');
    subject.subscribe();
    const socket1 = MockWebSocket.lastSocket;
    socket1.open();
    subject.complete();

    subject.next('a mariner yer not. yarrr.');
    subject.subscribe();
    const socket2 = MockWebSocket.lastSocket;
    socket2.open();

    expect(socket2).not.to.equal(socket1);
    expect(socket2.lastMessageSent).to.equal('a mariner yer not. yarrr.');

    subject.unsubscribe();
  });

  it('should allow resubscription after closure via error', () => {
    const subject = Observable.webSocket('ws://mysocket');
    subject.subscribe();
    const socket1 = MockWebSocket.lastSocket;
    socket1.open();
    subject.error({ code: 1337 });

    subject.next('yo-ho! yo-ho!');
    subject.subscribe();
    const socket2 = MockWebSocket.lastSocket;
    socket2.open();

    expect(socket2).not.to.equal(socket1);
    expect(socket2.lastMessageSent).to.equal('yo-ho! yo-ho!');

    subject.unsubscribe();
  });

  it('should have a default resultSelector that parses message data as JSON', () => {
    let result;
    const expected = { mork: 'shazbot!' };
    const subject = Observable.webSocket('ws://mysocket');

    subject.subscribe((x: any) => {
      result = x;
    });

    const socket = MockWebSocket.lastSocket;
    socket.open();
    socket.triggerMessage(JSON.stringify(expected));

    expect(result).to.deep.equal(expected);

    subject.unsubscribe();
  });

  describe('with a config object', () => {
    it('should send and receive messages', () => {
      let messageReceived = false;
      const subject = Observable.webSocket({ url: 'ws://mysocket' });

      subject.next('ping');

      subject.subscribe((x: string) => {
        expect(x).to.equal('pong');
        messageReceived = true;
      });

      const socket = MockWebSocket.lastSocket;
      expect(socket.url).to.equal('ws://mysocket');

      socket.open();
      expect(socket.lastMessageSent).to.equal('ping');

      socket.triggerMessage(JSON.stringify('pong'));
      expect(messageReceived).to.be.true;

      subject.unsubscribe();
    });

    it('should take a protocol and set it properly on the web socket', () => {
      const subject = Observable.webSocket({
        url: 'ws://mysocket',
        protocol: 'someprotocol'
      });

      subject.subscribe();

      const socket = MockWebSocket.lastSocket;
      expect(socket.protocol).to.equal('someprotocol');

      subject.unsubscribe();
    });

    it('should take a binaryType and set it properly on the web socket', () => {
      const subject = Observable.webSocket({
        url: 'ws://mysocket',
        binaryType: 'blob'
      });

      subject.subscribe();

      const socket = MockWebSocket.lastSocket;
      expect(socket.binaryType).to.equal('blob');

      subject.unsubscribe();
    });

    it('should take a resultSelector', () => {
      const results = [];

      const subject = Observable.webSocket({
        url: 'ws://mysocket',
        resultSelector: (e: any) => {
          return e.data + '!';
        }
      });

      subject.subscribe((x: any) => {
        results.push(x);
      });

      const socket = MockWebSocket.lastSocket;
      socket.open();
      ['ahoy', 'yarr', 'shove off'].forEach((x: any) => {
        socket.triggerMessage(x);
      });

      expect(results).to.deep.equal(['ahoy!', 'yarr!', 'shove off!']);

      subject.unsubscribe();
    });

    it('if the resultSelector fails it should go down the error path', () => {
      const subject = Observable.webSocket({
        url: 'ws://mysocket',
        resultSelector: (e: any) => {
          throw new Error('I am a bad error');
        }
      });

      subject.subscribe((x: any) => {
        expect(x).to.equal('this should not happen');
      }, (err: any) => {
        expect(err).to.be.an('error', 'I am a bad error');
      });

      const socket = MockWebSocket.lastSocket;
      socket.open();
      socket.triggerMessage('weee!');

      subject.unsubscribe();
    });

    it('should accept a closingObserver', () => {
      let calls = 0;
      const subject = Observable.webSocket(<any>{
        url: 'ws://mysocket',
        closingObserver: {
          next: function (x) {
            calls++;
            expect(x).to.be.an('undefined');
          }
        }
      });

      subject.subscribe();
      let socket = MockWebSocket.lastSocket;
      socket.open();

      expect(calls).to.equal(0);

      subject.complete();
      expect(calls).to.equal(1);

      subject.subscribe();
      socket = MockWebSocket.lastSocket;
      socket.open();

      subject.error({ code: 1337 });
      expect(calls).to.equal(2);

      subject.unsubscribe();
    });

    it('should accept a closeObserver', () => {
      const expected = [{ wasClean: true }, { wasClean: false }];
      const closes = [];
      const subject = Observable.webSocket(<any>{
        url: 'ws://mysocket',
        closeObserver: {
          next: function (e) {
            closes.push(e);
          }
        }
      });

      subject.subscribe();
      let socket = MockWebSocket.lastSocket;
      socket.open();

      expect(closes.length).to.equal(0);

      socket.triggerClose(expected[0]);
      expect(closes.length).to.equal(1);

      subject.subscribe(null, function (err) {
        expect(err).to.equal(expected[1]);
      });

      socket = MockWebSocket.lastSocket;
      socket.open();

      socket.triggerClose(expected[1]);
      expect(closes.length).to.equal(2);

      expect(closes[0]).to.equal(expected[0]);
      expect(closes[1]).to.equal(expected[1]);

      subject.unsubscribe();
    });

    it('should handle constructor errors', () => {
      const subject = Observable.webSocket(<any>{
        url: 'bad_url',
        WebSocketCtor: (url: string, protocol?: string | string[]): WebSocket => {
          throw new Error(`connection refused`);
        }
      });

      subject.subscribe((x: any) => {
        expect(x).to.equal('this should not happen');
      }, (err: any) => {
        expect(err).to.be.an('error', 'connection refused');
      });

      subject.unsubscribe();
    });
  });

  describe('multiplex', () => {
    it('should be retryable', () => {
      const results = [];
      const subject = Observable.webSocket('ws://websocket');
      const source = subject.multiplex(() => {
        return { sub: 'foo'};
      }, () => {
        return { unsub: 'foo' };
      }, function (value: any) {
        return value.name === 'foo';
      });

      source
        .retry(1)
        .map((x: any) => x.value)
        .take(2)
        .subscribe((x: any) => {
          results.push(x);
        });

      const socket = MockWebSocket.lastSocket;
      socket.open();

      expect(socket.lastMessageSent).to.deep.equal({ sub: 'foo' });
      socket.triggerClose({ wasClean: false }); // Bad connection

      const socket2 = MockWebSocket.lastSocket;
      expect(socket2).not.to.equal(socket);

      socket2.open();
      expect(socket2.lastMessageSent).to.deep.equal({ sub: 'foo' });

      socket2.triggerMessage(JSON.stringify({ name: 'foo', value: 'test' }));
      socket2.triggerMessage(JSON.stringify({ name: 'foo', value: 'this' }));

      expect(results).to.deep.equal(['test', 'this']);
    });

    it('should be repeatable', () => {
      const results = [];
      const subject = Observable.webSocket('ws://websocket');
      const source = subject.multiplex(() => {
        return { sub: 'foo'};
      }, () => {
        return { unsub: 'foo' };
      }, function (value: any) {
        return value.name === 'foo';
      });

      source
        .repeat(2)
        .map((x: any) => x.value)
        .subscribe((x: any) => {
          results.push(x);
        });

      const socket = MockWebSocket.lastSocket;
      socket.open();

      expect(socket.lastMessageSent).to.deep.equal({ sub: 'foo' }, 'first multiplexed sub');
      socket.triggerMessage(JSON.stringify({ name: 'foo', value: 'test' }));
      socket.triggerMessage(JSON.stringify({ name: 'foo', value: 'this' }));
      socket.triggerClose({ wasClean: true });

      const socket2 = MockWebSocket.lastSocket;
      expect(socket2).not.to.equal(socket, 'a new socket was not created');

      socket2.open();
      expect(socket2.lastMessageSent).to.deep.equal({ sub: 'foo' }, 'second multiplexed sub');
      socket2.triggerMessage(JSON.stringify({ name: 'foo', value: 'test' }));
      socket2.triggerMessage(JSON.stringify({ name: 'foo', value: 'this' }));
      socket2.triggerClose({ wasClean: true });

      expect(results).to.deep.equal(['test', 'this', 'test', 'this'], 'results were not equal');
    });

    it('should multiplex over the websocket', () => {
      const results = [];
      const subject = Observable.webSocket('ws://websocket');
      const source = subject.multiplex(() => {
        return { sub: 'foo'};
      }, () => {
        return { unsub: 'foo' };
      }, function (value: any) {
        return value.name === 'foo';
      });

      const sub = source.subscribe(function (x: any) {
        results.push(x.value);
      });
      const socket = MockWebSocket.lastSocket;
      socket.open();

      expect(socket.lastMessageSent).to.deep.equal({ sub: 'foo' });

      [1, 2, 3, 4, 5].map((x: number) => {
        return {
          name: x % 3 === 0 ? 'bar' : 'foo',
          value: x
        };
      }).forEach((x: any) => {
        socket.triggerMessage(JSON.stringify(x));
      });

      expect(results).to.deep.equal([1, 2, 4, 5]);

      sinon.spy(socket, 'close');
      sub.unsubscribe();
      expect(socket.lastMessageSent).to.deep.equal({ unsub: 'foo' });

      expect(socket.close).have.been.called;
      (<any>socket.close).restore();
    });

    it('should keep the same socket for multiple multiplex subscriptions', () => {
      const socketSubject = Rx.Observable.webSocket(<any>{url: 'ws://mysocket'});
      const results = [];
      const socketMessages = [
        {id: 'A'},
        {id: 'B'},
        {id: 'A'},
        {id: 'B'},
        {id: 'B'},
      ];

      const sub1 = socketSubject.multiplex(
        () => 'no-op',
        () => results.push('A unsub'),
        (req: any) => req.id === 'A')
        .takeWhile((req: any) => !req.complete)
        .subscribe(
          () => results.push('A next'),
          (e) => results.push('A error ' + e),
          () => results.push('A complete')
        );

      socketSubject.multiplex(
        () => 'no-op',
        () => results.push('B unsub'),
        (req: any) => req.id === 'B')
        .subscribe(
          () => results.push('B next'),
          (e) => results.push('B error ' + e),
          () => results.push('B complete')
        );

      // Setup socket and send messages
      let socket = MockWebSocket.lastSocket;
      socket.open();
      socketMessages.forEach((msg, i) => {
        if (i === 1) {
          sub1.unsubscribe();
          expect(socketSubject.socket).to.equal(socket);
        }
        socket.triggerMessage(JSON.stringify(msg));
      });
      socket.triggerClose({ wasClean: true });

      expect(results).to.deep.equal([
        'A next',
        'A unsub',
        'B next',
        'B next',
        'B next',
        'B complete',
        'B unsub',
      ]);
    });

    it('should not close the socket until all subscriptions complete', () => {
      const socketSubject = Rx.Observable.webSocket(<any>{url: 'ws://mysocket'});
      const results = [];
      const socketMessages = [
        {id: 'A'},
        {id: 'B'},
        {id: 'A', complete: true},
        {id: 'B'},
        {id: 'B', complete: true},
      ];

      socketSubject.multiplex(
        () => 'no-op',
        () => results.push('A unsub'),
        (req: any) => req.id === 'A')
        .takeWhile((req: any) => !req.complete)
        .subscribe(
          () => results.push('A next'),
          (e) => results.push('A error ' + e),
          () => results.push('A complete')
        );

      socketSubject.multiplex(
        () => 'no-op',
        () => results.push('B unsub'),
        (req: any) => req.id === 'B')
        .takeWhile((req: any) => !req.complete)
        .subscribe(
          () => results.push('B next'),
          (e) => results.push('B error ' + e),
          () => results.push('B complete')
        );

      // Setup socket and send messages
      let socket = MockWebSocket.lastSocket;
      socket.open();
      socketMessages.forEach((msg) => {
        socket.triggerMessage(JSON.stringify(msg));
      });

      expect(results).to.deep.equal([
        'A next',
        'B next',
        'A complete',
        'A unsub',
        'B next',
        'B complete',
        'B unsub',
      ]);
    });
  });
});

class MockWebSocket {
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
  binaryType?: string;

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