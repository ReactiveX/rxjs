import {Component, OnInit} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {map} from 'rxjs/operators';
import {BreakingChange, Deprecation, Release, TimeLineTypes} from './data-access/interfaces';
import {MigrationTimelineService} from './data-access/migration-timeline.service';

export interface VMReleaseNavigationItem {
  date: string;
  name: string;
  link: string;
}

export interface VMReleaseListItem {
  type: TimeLineTypes,
  headline: string
}

export type VMReleaseList = VMReleaseListItem[];


@Component({
  selector: `rxjs-migration-timeline`,
  template: `
    <h1>RxJS Migration Timeline</h1>
    <p>
      Some Text here...
    </p>
    <h2>Supported Varsion</h2>
    <div class="flex-center group-buttons">
      <mat-chip-list>
        <mat-chip
          *ngFor="let option of releaseNavigation$ | async"
          [selected]="(selectedRelease$ | async) === option.name"
          (click)="selectedRelease$.next(option.name)">{{option.name}}</mat-chip>
      </mat-chip-list>
    </div>
    <h2>Timeline</h2>
    <section class="grid-fluid">
      <div class="release-group">
        <div *ngFor="let item of releaseList$ | async">
          <h3>{{item.headline}}</h3>
        </div>
      </div>
    </section>`
})
export class MigrationTimelineComponent implements OnInit {

  selectedRelease$ = new ReplaySubject<string>(1);
  releaseNavigation$: Observable<VMReleaseNavigationItem[]> = this.mtlService.migrations$
    .pipe(map(this.parseVmReleases));
  releaseList$: Observable<VMReleaseList> = this.mtlService.migrations$
    .pipe(map(this.parseVmReleaseList));


  constructor(public mtlService: MigrationTimelineService) {
    this.mtlService.fetchMigrationTimeline();
  }

  ngOnInit() {
    // no need to unsubscribe because `contributors` completes
  }

  parseVmReleases(releases: Release[]): VMReleaseNavigationItem[] {
    return releases.reduce((res, release) => {
      const navigationItem: VMReleaseNavigationItem = {
        date: release.date,
        name: release.version,
        link: '@TODO'
      };
      res.push(navigationItem);
      return res;
    }, [] as VMReleaseNavigationItem[]);
  }

  parseVmReleaseList(releases: Release[]): VMReleaseListItem[] {
    return releases.reduce((res: VMReleaseListItem[], release) => {
      res = res.concat(release.deprecations    ? release.deprecations.map(parseReleaseListItem) : []);
      res = res.concat(release.breakingChanges ? release.breakingChanges.map(parseReleaseListItem) : []);
      return res;
    }, []);

    function parseReleaseListItem(i: Deprecation | BreakingChange): VMReleaseListItem {
      return {
        type: i.type,
        headline: i.headline
      };
    }
  }

}
