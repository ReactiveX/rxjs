import { expect } from 'chai';
import { expectObservable } from './helpers/marble-testing';
import { Notification, Subscriber } from 'rxjs';

/** @test {Notification} */
describe('Notification', () => {
  it('should exist', () => {
    expect(Notification).exist;
    expect(Notification).to.be.a('function');
  });

  it('should not allow convert to observable if given kind is unknown', () => {
    const n = new Notification('x' as any);
    expect(() => n.toObservable()).to.throw();
  });

  describe('createNext', () => {
    it('should return a Notification', () => {
      const n = Notification.createNext('test');
      expect(n instanceof Notification).to.be.true;
      expect(n.value).to.equal('test');
      expect(n.kind).to.equal('N');
      expect(n.error).to.be.a('undefined');
      expect(n.hasValue).to.be.true;
    });
  });

  describe('createError', () => {
    it('should return a Notification', () => {
      const n = Notification.createError('test');
      expect(n instanceof Notification).to.be.true;
      expect(n.value).to.be.a('undefined');
      expect(n.kind).to.equal('E');
      expect(n.error).to.equal('test');
      expect(n.hasValue).to.be.false;
    });
  });

  describe('createComplete', () => {
    it('should return a Notification', () => {
      const n = Notification.createComplete();
      expect(n instanceof Notification).to.be.true;
      expect(n.value).to.be.a('undefined');
      expect(n.kind).to.equal('C');
      expect(n.error).to.be.a('undefined');
      expect(n.hasValue).to.be.false;
    });
  });

  describe('toObservable', () => {
    it('should create observable from a next Notification', () => {
      const value = 'a';
      const next = Notification.createNext(value);
      expectObservable(next.toObservable()).toBe('(a|)');
    });

    it('should create observable from a complete Notification', () => {
      const complete = Notification.createComplete();
      expectObservable(complete.toObservable()).toBe('|');
    });

    it('should create observable from a error Notification', () => {
      const error = Notification.createError('error');
      expectObservable(error.toObservable()).toBe('#');
    });
  });

  describe('static reference', () => {
    it('should create new next Notification with value', () => {
      const value = 'a';
      const first = Notification.createNext(value);
      const second = Notification.createNext(value);

      expect(first).not.to.equal(second);
    });

    it('should create new error Notification', () => {
      const first = Notification.createError();
      const second = Notification.createError();

      expect(first).not.to.equal(second);
    });

    it('should return static next Notification reference without value', () => {
      const first = Notification.createNext(undefined);
      const second = Notification.createNext(undefined);

      expect(first).to.equal(second);
    });

    it('should return static complete Notification reference', () => {
      const first = Notification.createComplete();
      const second = Notification.createComplete();

      expect(first).to.equal(second);
    });
  });

  describe('do', () => {
    it('should invoke on next', () => {
      const n = Notification.createNext('a');
      let invoked = false;
      n.do((x: string) => {
        invoked = true;
      }, (err: any) => {
        throw 'should not be called';
      }, () => {
        throw 'should not be called';
      });

      expect(invoked).to.be.true;
    });

    it('should invoke on error', () => {
      const n = Notification.createError();
      let invoked = false;
      n.do((x: any) => {
        throw 'should not be called';
      }, (err: any) => {
        invoked = true;
      }, () => {
        throw 'should not be called';
      });

      expect(invoked).to.be.true;
    });

    it('should invoke on complete', () => {
      const n = Notification.createComplete();
      let invoked = false;
      n.do((x: any) => {
        throw 'should not be called';
      }, (err: any) => {
        throw 'should not be called';
      }, () => {
        invoked = true;
      });

      expect(invoked).to.be.true;
    });
  });

  describe('accept', () => {
    it('should accept observer for next Notification', () => {
      const value = 'a';
      let observed = false;
      const n = Notification.createNext(value);
      const observer = Subscriber.create((x: string) => {
        expect(x).to.equal(value);
        observed = true;
      }, (err: any) => {
        throw 'should not be called';
      }, () => {
        throw 'should not be called';
      });

      n.accept(observer);
      expect(observed).to.be.true;
    });

    it('should accept observer for error Notification', () => {
      let observed = false;
      const n = Notification.createError<string>();
      const observer = Subscriber.create((x: string) => {
        throw 'should not be called';
      }, (err: any) => {
        observed = true;
      }, () => {
        throw 'should not be called';
      });

      n.accept(observer);
      expect(observed).to.be.true;
    });

    it('should accept observer for complete Notification', () => {
      let observed = false;
      const n = Notification.createComplete();
      const observer = Subscriber.create((x: string) => {
        throw 'should not be called';
      }, (err: any) => {
        throw 'should not be called';
      }, () => {
        observed = true;
      });

      n.accept(observer);
      expect(observed).to.be.true;
    });

    it('should accept function for next Notification', () => {
      const value = 'a';
      let observed = false;
      const n = Notification.createNext(value);

      n.accept((x: string) => {
        expect(x).to.equal(value);
        observed = true;
      }, (err: any) => {
        throw 'should not be called';
      }, () => {
        throw 'should not be called';
      });
      expect(observed).to.be.true;
    });

    it('should accept function for error Notification', () => {
      let observed = false;
      const error = 'error';
      const n = Notification.createError(error);

      n.accept((x: any) => {
        throw 'should not be called';
      }, (err: any) => {
        expect(err).to.equal(error);
        observed = true;
      }, () => {
        throw 'should not be called';
      });
      expect(observed).to.be.true;
    });

    it('should accept function for complete Notification', () => {
      let observed = false;
      const n = Notification.createComplete();

      n.accept((x: any) => {
        throw 'should not be called';
      }, (err: any) => {
        throw 'should not be called';
      }, () => {
        observed = true;
      });
      expect(observed).to.be.true;
    });
  });

  describe('observe', () => {
    it('should observe for next Notification', () => {
      const value = 'a';
      let observed = false;
      const n = Notification.createNext(value);
      const observer = Subscriber.create((x: string) => {
        expect(x).to.equal(value);
        observed = true;
      }, (err: any) => {
        throw 'should not be called';
      }, () => {
        throw 'should not be called';
      });

      n.observe(observer);
      expect(observed).to.be.true;
    });

    it('should observe for error Notification', () => {
      let observed = false;
      const n = Notification.createError();
      const observer = Subscriber.create((x: any) => {
        throw 'should not be called';
      }, (err: any) => {
        observed = true;
      }, () => {
        throw 'should not be called';
      });

      n.observe(observer);
      expect(observed).to.be.true;
    });

    it('should observe for complete Notification', () => {
      let observed = false;
      const n = Notification.createComplete();
      const observer = Subscriber.create((x: any) => {
        throw 'should not be called';
      }, (err: any) => {
        throw 'should not be called';
      }, () => {
        observed = true;
      });

      n.observe(observer);
      expect(observed).to.be.true;
    });
  });
});
