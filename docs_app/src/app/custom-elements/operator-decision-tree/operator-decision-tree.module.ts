import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { ScrollService } from 'app/shared/scroll.service';
import { WithCustomElementComponent } from '../element-registry';
import { OperatorDecisionTreeDataService } from './operator-decision-tree-data.service';
import { OperatorDecisionTreeComponent } from './operator-decision-tree.component';
import { OperatorDecisionTreeService } from './operator-decision-tree.service';

@NgModule({
  imports: [CommonModule, MatButtonModule, MatCardModule, MatRippleModule],
  declarations: [OperatorDecisionTreeComponent],
  entryComponents: [OperatorDecisionTreeComponent],
  providers: [
    OperatorDecisionTreeDataService,
    OperatorDecisionTreeService,
    ScrollService
  ]
})
export class OperatorDecisionTreeModule implements WithCustomElementComponent {
  customElementComponent: Type<
    OperatorDecisionTreeComponent
  > = OperatorDecisionTreeComponent;
}
