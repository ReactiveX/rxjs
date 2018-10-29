import { TestBed } from '@angular/core/testing';
import { OperatorDecisionTreeDataService } from './operator-decision-tree-data.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { treeStub } from './fixtures';

describe('OperatorDecisionTreeDataService', () => {
  let service: OperatorDecisionTreeDataService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OperatorDecisionTreeDataService]
    });

    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(OperatorDecisionTreeDataService);
  });

  describe('getDecisionTree$', () => {
    it('should get the decision-tree-data.json', () => {
      service.getDecisionTree$().subscribe(
        data => expect(data).toBe(treeStub)
      )
      const req = httpTestingController.expectOne('/generated/docs/app/decision-tree-data.json')
      expect(req.request.method).toEqual('GET')

      req.flush(treeStub)
      httpTestingController.verify();
    });
  });
});
