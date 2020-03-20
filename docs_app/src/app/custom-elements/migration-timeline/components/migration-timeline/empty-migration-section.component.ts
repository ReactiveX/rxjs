import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: `empty-migration-section`,
  template: `
    <mat-card class="migration-section empty">
      <mat-card-header class="migration-headline">
        <mat-card-title>
          <ng-content>

          </ng-content>
        </mat-card-title>
      </mat-card-header>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyMigrationSectionComponent {

}
