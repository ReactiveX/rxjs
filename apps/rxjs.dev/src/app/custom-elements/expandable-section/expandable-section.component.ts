/* tslint:disable component-selector */
import { Component, Input } from '@angular/core';

/** Custom element wrapper for the material expansion panel with a title input. */
@Component({
  selector: 'aio-expandable-section',
  template: `<mat-expansion-panel style="background: inherit">
    <mat-expansion-panel-header>
      {{ title }}
    </mat-expansion-panel-header>

    <ng-content></ng-content>
  </mat-expansion-panel> `,
})
export class ExpandableSectionComponent {
  @Input() title: string;
}
