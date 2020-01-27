import {ChangeDetectionStrategy, Component, Input, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {ClientMigrationTimelineReleaseItem} from '../../data-access';

@Component({
  selector: `release-title`,
  template: `
    <shield [label]="'github'" [version]="_release.version"
      (click)="shieldClick.next($event)">
    </shield>&nbsp;-&nbsp;{{_release.date | date:'dd.MM.yyyy'}}&nbsp;-
    <ng-container *ngIf="(_expandedRelease)[_release.version]">&nbsp;
      <mat-icon aria-hidden="false" aria-label="Deprecations">warning
      </mat-icon>&nbsp;Deprecations:&nbsp;{{_release.deprecations.length}}&nbsp;
      <mat-icon aria-hidden="false" aria-label="Deprecations">error
      </mat-icon>&nbsp;BreakingChanges:&nbsp;{{_release.breakingChanges.length}}
    </ng-container>
    <ng-container *ngIf="!(_expandedRelease)[_release.version]">
      <mat-icon *ngIf="_release.deprecations.length" aria-hidden="false" aria-label="Deprecations">warning
      </mat-icon>&nbsp;
      <span *ngIf="_release.deprecations.length">{{_release.deprecations.length}}</span>
      <mat-icon *ngIf="_release.breakingChanges.length" aria-hidden="false" aria-label="BreakingChange">error
      </mat-icon>
      &nbsp;
      <span *ngIf="_release.breakingChanges.length">{{_release.breakingChanges.length}}</span>&nbsp;
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReleaseTitleComponent {

  _release: ClientMigrationTimelineReleaseItem;
  @Input()
  set release(release: ClientMigrationTimelineReleaseItem) {
    if (release) {
      this._release = release;
    }
  }

  _expandedRelease: boolean;
  @Input()
  set expandedRelease(expandedRelease: boolean) {
    if (expandedRelease) {
      this._expandedRelease = expandedRelease;
    }
  }

  @Output()
  shieldClick = new Subject<Event>();
}
