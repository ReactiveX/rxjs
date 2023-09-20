import { OperatorDecisionTreeModule } from './operator-decision-tree.module';

describe('OperatorDecisionTreeModule', () => {
  let chooseYourOwnOperatorModule: OperatorDecisionTreeModule;

  beforeEach(() => {
    chooseYourOwnOperatorModule = new OperatorDecisionTreeModule();
  });

  it('should create an instance', () => {
    expect(chooseYourOwnOperatorModule).toBeTruthy();
  });
});
