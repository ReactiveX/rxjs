import * as Rx from '../../../dist/cjs/Rx.DOM';
import {MockWebSocket} from '../../helpers/ajax-helper';

declare const __root__: any;

const Observable = Rx.Observable;
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

/** @test {webSocket} */
describe('Observable.webSocket', () => {
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
      expect(x).toBe('pong');
      messageReceived = true;
    });

    const socket = MockWebSocket.lastSocket;
    expect(socket.url).toBe('ws://mysocket');

    socket.open();
    expect(socket.lastMessageSent).toBe('ping');

    socket.triggerMessage(JSON.stringify('pong'));
    expect(messageReceived).toBe(true);

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

    expect(results).toEqual(expected);

    subject.unsubscribe();
  });

  it('should queue messages prior to subscription', () => {
    const expected = ['make', 'him', 'walk', 'the', 'plank'];
    const subject = Observable.webSocket('ws://mysocket');

    expected.forEach((x: string) => {
      subject.next(x);
    });

    let socket = MockWebSocket.lastSocket;
    expect(socket).not.toBeDefined();

    subject.subscribe();

    socket = MockWebSocket.lastSocket;
    expect(socket.sent.length).toBe(0);

    socket.open();
    expect(socket.sent.length).toBe(expected.length);

    subject.unsubscribe();
  });

  it('should send messages immediately if already open', () => {
    const subject = Observable.webSocket('ws://mysocket');
    subject.subscribe();
    const socket = MockWebSocket.lastSocket;
    socket.open();

    subject.next('avast!');
    expect(socket.lastMessageSent).toBe('avast!');
    subject.next('ye swab!');
    expect(socket.lastMessageSent).toBe('ye swab!');

    subject.unsubscribe();
  });

  it('should close the socket when completed', () => {
    const subject = Observable.webSocket('ws://mysocket');
    subject.subscribe();
    const socket = MockWebSocket.lastSocket;
    socket.open();

    expect(socket.readyState).toBe(1); // open

    spyOn(socket, 'close').and.callThrough();
    expect(socket.close).not.toHaveBeenCalled();

    subject.complete();
    expect(socket.close).toHaveBeenCalled();
    expect(socket.readyState).toBe(3); // closed

    subject.unsubscribe();
  });

  it('should close the socket with a code and a reason when errored', () => {
    const subject = Observable.webSocket('ws://mysocket');
    subject.subscribe();
    const socket = MockWebSocket.lastSocket;
    socket.open();

    spyOn(socket, 'close').and.callThrough();
    expect(socket.close).not.toHaveBeenCalled();

    subject.error({ code: 1337, reason: 'Too bad, so sad :('});
    expect(socket.close).toHaveBeenCalledWith(1337, 'Too bad, so sad :(');

    subject.unsubscribe();
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

    expect(socket2).not.toBe(socket1);
    expect(socket2.lastMessageSent).toBe('a mariner yer not. yarrr.');

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

    expect(socket2).not.toBe(socket1);
    expect(socket2.lastMessageSent).toBe('yo-ho! yo-ho!');

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

    expect(result).toEqual(expected);

    subject.unsubscribe();
  });

  describe('with a config object', () => {
    it('should send and receive messages', () => {
      let messageReceived = false;
      const subject = Observable.webSocket({ url: 'ws://mysocket' });

      subject.next('ping');

      subject.subscribe((x: string) => {
        expect(x).toBe('pong');
        messageReceived = true;
      });

      const socket = MockWebSocket.lastSocket;
      expect(socket.url).toBe('ws://mysocket');

      socket.open();
      expect(socket.lastMessageSent).toBe('ping');

      socket.triggerMessage(JSON.stringify('pong'));
      expect(messageReceived).toBe(true);

      subject.unsubscribe();
    });

    it('should take a protocol and set it properly on the web socket', () => {
      const subject = Observable.webSocket({
        url: 'ws://mysocket',
        protocol: 'someprotocol'
      });

      subject.subscribe();

      const socket = MockWebSocket.lastSocket;
      expect(socket.protocol).toBe('someprotocol');

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

      expect(results).toEqual(['ahoy!', 'yarr!', 'shove off!']);

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
        expect(x).toBe('this should not happen');
      }, (err: any) => {
        expect(err).toEqual(new Error('I am a bad error'));
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
            expect(x).toBe(undefined);
          }
        }
      });

      subject.subscribe();
      let socket = MockWebSocket.lastSocket;
      socket.open();

      expect(calls).toBe(0);

      subject.complete();
      expect(calls).toBe(1);

      subject.subscribe();
      socket = MockWebSocket.lastSocket;
      socket.open();

      subject.error({ code: 1337 });
      expect(calls).toBe(2);

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

      expect(closes.length).toBe(0);

      socket.triggerClose(expected[0]);
      expect(closes.length).toBe(1);

      subject.subscribe(null, function (err) {
        expect(err).toBe(expected[1]);
      });

      socket = MockWebSocket.lastSocket;
      socket.open();

      socket.triggerClose(expected[1]);
      expect(closes.length).toBe(2);

      expect(closes[0]).toBe(expected[0]);
      expect(closes[1]).toBe(expected[1]);

      subject.unsubscribe();
    });
  });

  describe('multiplex', () => {
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

      expect(socket.lastMessageSent).toEqual({ sub: 'foo' });

      [1, 2, 3, 4, 5].map((x: number) => {
        return {
          name: x % 3 === 0 ? 'bar' : 'foo',
          value: x
        };
      }).forEach((x: any) => {
        socket.triggerMessage(JSON.stringify(x));
      });

      expect(results).toEqual([1, 2, 4, 5]);

      spyOn(socket, 'close').and.callThrough();
      sub.unsubscribe();
      expect(socket.lastMessageSent).toEqual({ unsub: 'foo' });

      expect(socket.close).toHaveBeenCalled();
    });
  });
});