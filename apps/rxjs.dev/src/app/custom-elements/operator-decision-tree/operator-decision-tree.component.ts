import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy } from '@angular/core';
import { ScrollService } from 'app/shared/scroll.service';
import { Observable } from 'rxjs';
import { OperatorTreeNode } from './interfaces';
import { OperatorDecisionTreeService } from './operator-decision-tree.service';

@Component({
  selector: 'aio-operator-decision-tree',
  template: `
    <h1 class="mat-heading" tabindex="0">Operator Decision Tree</h1>
    <ng-container *ngIf="(hasError$ | async) === false; else hasErrorTemplate">
      <h2 class="mat-subheading-2" tabindex="0">
        {{ currentSentence$ | async }}
      </h2>
      <ng-container *ngIf="isBeyondInitialQuestion$ | async">
        <section>
          <button (click)="back()" mat-button class="back">Back</button>
          <button (click)="startOver()" mat-button color="warn" class="start-over">Start Over</button>
        </section>
      </ng-container>
      <div>
        <ng-container *ngFor="let option of options$ | async">
          <ng-container *ngIf="option.options; else operatorTemplate">
            <button class="option mat-body-1" (click)="selectOption(option.id)" [@flyIn]>
              <mat-card matRipple>
                {{ option.label }}
              </mat-card>
            </button>
          </ng-container>
          <ng-template #operatorTemplate>
            <p *ngIf="option.method" class="mat-body-1">
              You want the {{ option.method }} of the {{ option.docType }}
              <a href="{{ option.path }}#{{ option.method }}">{{ option.label }}</a
              >.
            </p>
            <p *ngIf="!option.method" class="mat-body-1">
              You want the {{ option.docType }} <a href="{{ option.path }}">{{ option.label }}</a
              >.
            </p>
          </ng-template>
        </ng-container>
      </div>
    </ng-container>

    <ng-template #hasErrorTemplate>
      <div class="mat-body-1 error">
        <p>Oops! There was an issue loading the decision tree.. we're real sorry about that. Please try reloading the page.</p>
        <p>
          You can also try
          <a href="https://github.com/ReactiveX/rxjs/issues/new?template=documentation.md" target="_blank">submitting an issue on GitHub</a
          >.
        </p>
      </div>
    </ng-template>
  `,
  styleUrls: ['./operator-decision-tree.component.scss'],
  animations: [
    trigger('flyIn', [
      state('in', style({ transform: 'translateX(0)' })),
      transition(':enter', [style({ transform: 'translateX(-100%)' }), animate(250)]),
    ]),
  ],
})
export class OperatorDecisionTreeComponent implements OnDestroy {
  currentSentence$: Observable<string> = this.operatorDecisionTreeService.currentSentence$;
  options$: Observable<OperatorTreeNode[]> = this.operatorDecisionTreeService.options$;
  isBeyondInitialQuestion$: Observable<boolean> = this.operatorDecisionTreeService.isBeyondInitialQuestion$;
  hasError$: Observable<boolean> = this.operatorDecisionTreeService.hasError$;

  constructor(private operatorDecisionTreeService: OperatorDecisionTreeService, private scrollService: ScrollService) {}

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
