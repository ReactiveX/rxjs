import {Component, Input, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {distinctUntilChanged, map, tap} from 'rxjs/operators';
import {LocalState} from '../utils/local-state.service';

export interface VmReleaseNavigationItem {
  date: Date;
  versionNumber: number
  version: string;
  officialRelease: boolean
}

export interface VmReleaseNavigationComponent {
  baseURL: string,
  releaseList: VmReleaseNavigationItem[],
  selectedMigrationReleaseUID: string
}

@Component({
  selector: 'release-navigation',
  template: `
    <div class="flex-center group-buttons migration-timeline-navigation"
      *ngIf="vm$ | async as vm">
      <mat-chip-list>
        <a *ngFor="let option of vm.releaseList; trackBy:trackByVersion"
          [href]="vm.baseURL + '#' + option.version"
          (click)="versionSelectRequest.next({event: $event, version: option.version})"
          class="mat-chip mat-primary mat-standard-chip navigation-item"
          [ngClass]="{
          selected:vm.selectedMigrationReleaseUID === option.version,
          'is-official': !option.officialRelease
          }">
          version: {{option.version}}, versionNumber: {{option.versionNumber}}
        </a>
      </mat-chip-list>
    </div>
  `,
  styles: [],
  providers: [LocalState]
})
export class ReleaseNavigationComponent {

  vm$ = this.vm.select();

  versionSelectRequest = new Subject<Event | any>();

  @Input()
  set baseURL(baseURL: string) {
    if (baseURL) {
      this.vm.setSlice({baseURL});
    }
  }

  @Input()
  set selectedMigrationReleaseUID(selectedMigrationReleaseUID: string) {
    if (selectedMigrationReleaseUID) {
      this.vm.setSlice({selectedMigrationReleaseUID});
    }
  }

  @Input()
  set releaseList(releaseList: VmReleaseNavigationItem[]) {
    if (releaseList) {
      this.vm.setSlice({releaseList});
    }
  }

  @Output()
  selectedMigrationReleaseUIDChange = this.versionSelectRequest
    .pipe(
      tap(e => this.disposeEvents(e.event)),
      map(e => e.version),
      distinctUntilChanged()
    );

  constructor(private vm: LocalState<VmReleaseNavigationComponent>) {

  }

  trackByVersion(i: VmReleaseNavigationItem): number {
    return i.versionNumber;
  };

  private disposeEvents(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

}
