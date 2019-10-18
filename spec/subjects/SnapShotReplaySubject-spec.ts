import {SnapShotReplaySubject, Subject} from 'rxjs';
import {expect} from 'chai';

/** @test {SnapShotReplaySubject} */
describe('SnapShotReplaySubject', () => {
    it('should extend Subject', () => {
        const subject = new SnapShotReplaySubject(null);
        expect(subject).to.be.instanceof(Subject);
    });

    it('should be able construct with provided keyProvder', () => {
        const subject = new SnapShotReplaySubject<any>(value => {
            return value.key;
        });
        expect(subject).to.be.instanceof(SnapShotReplaySubject);
    });

    it('should contain 2 values ', () => {
        const subject = new SnapShotReplaySubject<any>(value => {
            return value.key;
        });
        const values = [];

        subject.next({key: 'IBM', price: 100});
        subject.next({key: 'IBM', price: 101});
        subject.next({key: 'IBM', price: 102});
        subject.next({key: 'AAPL', price: 200});

        subject.subscribe(value => {
            values.push(value);
        });

        expect(values.length).to.be.equal(2);
    });

    it('should have last published value for an item', () => {
        const subject = new SnapShotReplaySubject<any>(value => {
            return value.key;
        });

        let expected = 102;

        subject.next({key: 'IBM', price: 100});
        subject.next({key: 'IBM', price: 101});
        subject.next({key: 'IBM', price: 102});
        subject.next({key: 'AAPL', price: 200});

        subject.subscribe(value => {
          if ( value.key === 'IBM') {
              expected = value.price;
          }
        });

        expect(expected).to.be.equal(102);
    });

    it('should pump old and new values to multiple subscribers', (done: MochaDone) => {
        const subject = new SnapShotReplaySubject<any>(value => {
            return value.key;
        });
        let i = 0;
        let j = 0;
        const sub1Expected = [
            {key: 'IBM', price: 100},
            {key: 'IBM', price: 101},
            {key: 'AAPL', price: 103},
        ];
        const sub2Expected = [
            {key: 'IBM', price: 101},
            {key: 'AAPL', price: 103},
            ];

        subject.subscribe((x: any) => {
            expect(x.key).to.equal(sub1Expected[i].key);
            expect(x.price).to.equal(sub1Expected[i].price);
            i++;
        });

        subject.next( {key: 'IBM', price: 100});
        subject.next( {key: 'IBM', price: 101});

        subject.subscribe((x: any) => {
            expect(x.key).to.equal(sub2Expected[j].key);
            expect(x.price).to.equal(sub2Expected[j].price);
            j++;
        });

        subject.next( {key: 'AAPL', price: 103});

        done();

    });

});
