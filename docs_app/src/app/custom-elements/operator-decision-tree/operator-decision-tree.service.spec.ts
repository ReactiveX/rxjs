import { TestBed } from '@angular/core/testing';
import { cold } from 'jasmine-marbles';
import {
  treeNodeInitialStub,
  treeNodeStubNoOptions,
  treeNodeStubWithOptionsA,
  treeNodeStubWithOptionsB,
  treeStub
} from './fixtures';
import { OperatorDecisionTreeDataService } from './operator-decision-tree-data.service';
import { OperatorDecisionTreeService } from './operator-decision-tree.service';

describe('OperatorDecisionTreeService', () => {
  let service: OperatorDecisionTreeService;
  const dataServiceStub = {
    getDecisionTree$: jasmine.createSpy()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OperatorDecisionTreeService,
        {
          provide: OperatorDecisionTreeDataService,
          useValue: dataServiceStub
        }
      ]
    });
  });

  describe('currentSentence$', () => {
    const initialSetence = 'Start by choosing an option from the list below.';

    beforeEach(() => {
      dataServiceStub.getDecisionTree$.and.returnValue(
        cold('x', { x: treeStub })
      );
      service = TestBed.get(OperatorDecisionTreeService);
    });

    describe('when it is the initial sequence', () => {
      it('should emit an initial sentence', () => {
        spyOn(service, 'selectOption');
        expect(service.currentSentence$).toBeObservable(
          cold('x', { x: initialSetence })
        );
        expect(service.selectOption).not.toHaveBeenCalled();
      });
    });

    describe('when an option is selected', () => {
      it('should emit a sentence based on previous chosen labels', () => {
        service.selectOption(treeNodeStubWithOptionsA.id);
        expect(service.currentSentence$).toBeObservable(
          cold('x', { x: `${treeNodeStubWithOptionsA.label}...` })
        );

        service.selectOption(treeNodeStubWithOptionsB.id);
        expect(service.currentSentence$).toBeObservable(
          cold('x', {
            x: `${treeNodeStubWithOptionsA.label} ${
              treeNodeStubWithOptionsB.label
            }...`
          })
        );
      });

      describe('and the back method is called', () => {
        it('should emit the previous sentence', () => {
          service.selectOption(treeNodeStubWithOptionsA.id);
          service.selectOption(treeNodeStubWithOptionsB.id);
          service.back();
          expect(service.currentSentence$).toBeObservable(
            cold('x', { x: `${treeNodeStubWithOptionsA.label}...` })
          );
        });
      });

      describe('and the startOver method is called', () => {
        it('should emit the initial sentence', () => {
          service.selectOption(treeNodeStubWithOptionsA.id);
          service.startOver();
          expect(service.currentSentence$).toBeObservable(
            cold('x', { x: initialSetence })
          );
        });
      });
    });
  });

  describe('options$', () => {
    describe('signals do not get past the filter,', () => {
      describe('when the tree has an error', () => {
        it('should never emit', () => {
          dataServiceStub.getDecisionTree$.and.returnValue(cold('#'));
          service = TestBed.get(OperatorDecisionTreeService);
          expect(service.options$).toBeObservable(cold('-'));
        });
      });

      describe('when the current branch has no options', () => {
        it('should never emit', () => {
          dataServiceStub.getDecisionTree$.and.returnValue(
            cold('x', {
              x: { [treeNodeStubNoOptions.id]: treeNodeStubNoOptions }
            })
          );
          service = TestBed.get(OperatorDecisionTreeService);
          expect(service.options$).toBeObservable(cold('-'));
        });
      });

      describe('when the currentBranchId does not exist in the tree', () => {
        it('should never emit', () => {
          dataServiceStub.getDecisionTree$.and.returnValue(
            cold('x', {
              x: { foo: treeNodeStubNoOptions }
            })
          );
          service = TestBed.get(OperatorDecisionTreeService);
          expect(service.options$).toBeObservable(cold('-'));
        });
      });
    });

    describe('when signals get past the filter', () => {
      beforeEach(() => {
        dataServiceStub.getDecisionTree$.and.returnValue(
          cold('x', { x: treeStub })
        );
        service = TestBed.get(OperatorDecisionTreeService);
      });

      describe('when it is the initial sequence', () => {
        it('should be an array of the tree nodes from the initial options', () => {
          expect(service.options$).toBeObservable(
            cold('a', { a: [treeStub[treeNodeInitialStub.initial.options[0]]] })
          );
        });
      });

      describe('when an option is selected', () => {
        describe('and there are additional options', () => {
          it('should be an array of the new option nodes', () => {
            service.selectOption(treeNodeStubWithOptionsA.id);
            expect(service.options$).toBeObservable(
              cold('a', { a: [treeNodeStubWithOptionsB] })
            );
          });
        });

        describe('and there are no additional options', () => {
          it('should not emit', () => {
            service.selectOption(treeNodeStubNoOptions.id);
            expect(service.options$).toBeObservable(cold('-'));
          });
        });
      });
    });
  });

  describe('isBeyondInitialQuestion$', () => {
    beforeEach(() => {
      dataServiceStub.getDecisionTree$.and.returnValue(
        cold('x', { x: treeStub })
      );
      service = TestBed.get(OperatorDecisionTreeService);
    });

    describe('when not beyond the initial question', () => {
      it('should be false', () => {
        spyOn(service, 'selectOption');
        expect(service.isBeyondInitialQuestion$).toBeObservable(
          cold('a', { a: false })
        );
        expect(service.selectOption).not.toHaveBeenCalled();
      });
    });

    describe('when beyond the initial question', () => {
      it('should be true', () => {
        service.selectOption(treeNodeStubWithOptionsA.id);
        expect(service.isBeyondInitialQuestion$).toBeObservable(
          cold('a', { a: true })
        );
      });
    });
  });

  describe('hasError$', () => {
    describe('when the tree has an error', () => {
      it('should be true', () => {
        dataServiceStub.getDecisionTree$.and.returnValue(cold('#'));
        service = TestBed.get(OperatorDecisionTreeService);
        expect(service.hasError$).toBeObservable(cold('(a|)', { a: true }));
      });
    });

    describe('when the tree has no error', () => {
      it('shoud not emit', () => {
        dataServiceStub.getDecisionTree$.and.returnValue(
          cold('x', { x: treeStub })
        );
        service = TestBed.get(OperatorDecisionTreeService);
        expect(service.hasError$).toBeObservable(cold('-'));
      });
    });
  });
});
