import {Component} from '@angular/core';
import {combineLatest, Subject} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MigrationTimelineContainerAdapter} from './migration-timeline.container.adapter';
import {VmTimelineContainerView} from './migration-timeline.interface';
import {LocalState} from './utils/local-state.service';
import {formatSemVerNumber} from './utils/operators';

@Component({
  selector: `rxjs-migration-timeline-container`,
  template: `
    <h1>RxJS Migration Timeline</h1>
    <p>
      The migration timeline is here to support you in the following things:
    </p>
    <ul>
      <li>
        <input type="checkbox" checked disabled>
        Getting detailed explanation on why a deprecation happened. <br/>
        Elaborating the different between the deprecated version and the new version
      </li>
      <li>
        <input type="checkbox" checked disabled>
        Explaining the implications of a deprecation
      </li>
      <li>
        <input type="checkbox" checked disabled>
        Code examples of the deprecated and the new version
      </li>
      <li>
        <input type="checkbox" disabled>
        Manual Migration suggestions (optional)
      </li>
      <li>
        <input type="checkbox" disabled>
        Migration over tooling (optional)
      </li>
    </ul>
    <h2>Supported Versions</h2>
    <ng-container *ngIf="vm$ | async as vm">
      <section>
        {{vm.filter}}<br>
        {{vm.releaseNavigation}}
        <filter-form
          [releaseList]="vm.releaseNavigation"
          (filterChange)="setSlice({filter: $event})">
        </filter-form>
      </section>
      <section>
        <release-navigation
          [selectedVersion]="vm.selectedVersion"
          [releaseList]="vm.releaseList">
        </release-navigation>
      </section>
      <h2>Timeline</h2>
      <section class="grid-fluid">
        <div class="release-group">
          <rxjs-migration-timeline
            [releaseList]="vm.releaseList"
            [selectedVersion]="vm.selectedVersion"
            [itemSubId]="vm.selectedItemSubId"
            (selectedVersionChange)="selectedVersionChange$.next($event)">
          </rxjs-migration-timeline>
        </div>
      </section>
    </ng-container>

    <msg-format-decision-helper></msg-format-decision-helper>
  `,
  providers: [MigrationTimelineContainerAdapter]
})
export class MigrationTimelineContainerComponent extends LocalState<VmTimelineContainerView> {
  // UI
  selectedVersionChange$ = new Subject<string>();
  vm$ = this.select();
  // derivations
  filteredReleaseNavigation$ = combineLatest(
    this.select('filter').pipe(startWith({from: '', to: ''})),
    this.select('releaseList')
  )
    .pipe(
      map(([filterCfg, list]) => {
        return list.filter(r => {
          return r.versionNumber >= formatSemVerNumber(filterCfg.from);
        });
      })
    );


  constructor(private va: MigrationTimelineContainerAdapter) {
    super();
    // UI State
    this.connectSlice('releaseList', this.va.releaseList$);
    this.connectSlice('releaseNavigation', this.va.releaseNavigation$);
    this.connectSlice('selectedVersion', this.va.selectedVersion$);
    // UI interactions
    this.va.selectedVersionChange.add(this.selectedVersionChange$);
  }

}

