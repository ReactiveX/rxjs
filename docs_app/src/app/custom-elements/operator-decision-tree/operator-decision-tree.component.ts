import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Component, OnDestroy } from '@angular/core';
import { ScrollService } from 'app/shared/scroll.service';
import { Observable } from 'rxjs';
import { OperatorTreeNode } from './interfaces';
import { OperatorDecisionTreeService } from './operator-decision-tree.service';

@Component({
  selector: 'aio-operator-decision-tree',
  templateUrl: './operator-decision-tree.component.html',
  styleUrls: ['./operator-decision-tree.component.scss'],
  animations: [
    trigger('flyIn', [
      state('in', style({ transform: 'translateX(0)' })),
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate(250)
      ])
    ])
  ]
})
export class OperatorDecisionTreeComponent implements OnDestroy {
  currentSentence$: Observable<string> = this.operatorDecisionTreeService.currentSentence$;
  options$: Observable<OperatorTreeNode[]> = this.operatorDecisionTreeService.options$;
  isBeyondInitialQuestion$: Observable<boolean> = this.operatorDecisionTreeService.isBeyondInitialQuestion$;
  hasError$: Observable<boolean> = this.operatorDecisionTreeService.hasError$;

  constructor(
    private operatorDecisionTreeService: OperatorDecisionTreeService,
    private scrollService: ScrollService
  ) {}

  selectOption(optionId: string): void {
    this.operatorDecisionTreeService.selectOption(optionId);
    this.scrollService.scrollToTop();
  }

  back(): void {
    this.operatorDecisionTreeService.back();
  }

  startOver(): void {
    this.operatorDecisionTreeService.startOver();
  }

  ngOnDestroy(): void {
    this.startOver();
  }
}
