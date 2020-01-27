import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

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

  _label: string;
  @Input()
  set label(label: string) {
    if (label) {
      this._label = label;
    }
  }

  _version: string;
  @Input()
  set version(version: string) {
    if (version) {
      this._version = version;
    }
  }

}
