import {Component, Input, OnInit} from '@angular/core';
import {ClientRelease} from '../data-access/interfaces';
import {VmReleaseNavigationItem} from '../migration-timeline.interface';
import {baseURL} from '../migration-timeline.module';
import {LocalState} from '../utils/local-state.service';

@Component({
  selector: 'release-navigation',
  template: `
    <div class="flex-center group-buttons migration-timeline-navigation"
      *ngIf="vm$ | async as vm">
      <mat-chip-list>
        <a *ngFor="let option of vm.releaseList; trackBy:trackByVersion"
          [href]="baseURL + '#' + option.version"
          class="mat-chip mat-primary mat-standard-chip navigation-item"
          [ngClass]="{
          selected:vm.selectedVersion === option.version,
          'is-official': !option.officialRelease
          }">
          version: {{option.version}}, versionNumber: {{option.versionNumber}}
        </a>
      </mat-chip-list>
    </div>
  `,
  styles: []
})
export class ReleaseNavigationComponent extends LocalState<{
  releaseList: VmReleaseNavigationItem[],
  selectedVersion: string
}> implements OnInit {
  baseURL = baseURL;
  vm$ = this.select();

  @Input()
  set selectedVersion(selectedVersion: string) {
    if (selectedVersion) {
      this.setSlice({selectedVersion});
    }
  }

  @Input()
  set releaseList(releaseList: VmReleaseNavigationItem[]) {
    if (releaseList) {
      this.setSlice({releaseList});
    }
  }

  constructor() {
    super();
  }

  trackByVersion(i: ClientRelease ): string { return i.version};

  ngOnInit() {
  }

}
