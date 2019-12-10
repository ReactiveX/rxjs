import {Component, Input, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {ClientMigrationTimelineReleaseItem} from '../data-access/migration-timeline.interface';
import {LocalState} from '../utils/local-state.service';

export interface MigrationTimelineNavigationItem {
  date: Date;
  versionNumber: number
  version: string;
  officialRelease: boolean
}

export interface MigrationTimelineNavigationComponentModel {
  releaseNavigationList: MigrationTimelineNavigationItem[];
  selectedMigrationReleaseUID: string;
}

@Component({
  selector: 'release-navigation',
  template: `
    <div class="flex-center group-buttons migration-timeline-navigation"
      *ngIf="baseModel$ | async as vm">
      <mat-chip-list>
        <a *ngFor="let option of vm.releaseNavigationList; trackBy:trackByVersion"
          (click)="selectedMigrationReleaseUIDChange.next(option.version)"
          class="mat-chip mat-primary mat-standard-chip navigation-item"
          [ngClass]="{
          selected:vm.selectedMigrationReleaseUID === option.version,
          'is-official': !option.officialRelease
          }">
          {{option.version}}
        </a>
      </mat-chip-list>
    </div>
  `,
  styles: [],
  providers: [LocalState]
})
export class ReleaseNavigationComponent {

  baseModel$ = this._baseModel.select();

  @Input()
  set selectedMigrationReleaseUID(selectedMigrationReleaseUID: string) {
    if (selectedMigrationReleaseUID) {
      this._baseModel.setSlice({selectedMigrationReleaseUID});
    }
  }

  @Input()
  set releaseList(releaseList: ClientMigrationTimelineReleaseItem[]) {
    if (releaseList) {
      console.log('releaseList MigrationTimelineNavigationItem[]', releaseList);
      const releaseNavigationList: MigrationTimelineNavigationItem[] = this.parseVmReleaseNavigation(releaseList);
      this._baseModel.setSlice({releaseNavigationList});
    }
  }


  @Output()
  selectedMigrationReleaseUIDChange = new Subject<string>();

  constructor(private _baseModel: LocalState<MigrationTimelineNavigationComponentModel>) {

  }

  trackByVersion(i: MigrationTimelineNavigationItem): number {
    return i.versionNumber;
  };

  private parseVmReleaseNavigation(releases: ClientMigrationTimelineReleaseItem[]): MigrationTimelineNavigationItem[] {
    return releases.reduce((res, release): MigrationTimelineNavigationItem[] => {
      const {deprecations, breakingChanges, ...navigationItem} = release;
      res.push(navigationItem);
      return res;
    }, [] as MigrationTimelineNavigationItem[]);
  }

}
