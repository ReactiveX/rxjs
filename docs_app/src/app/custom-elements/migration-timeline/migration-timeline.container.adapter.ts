import {Inject} from '@angular/core';
import {merge, Observable, of} from 'rxjs';
import {delay, distinctUntilChanged, filter, map, shareReplay, switchMap, take, tap} from 'rxjs/operators';
import {LocationService} from '../../shared/location.service';
import {VmReleaseNavigationItem} from './components/release-navigation.component';
import {ClientRelease, MigrationTimelineService} from './data-access/migration-timeline.service';
import {MigrationItemUIDAware, VmMigrationTimelineContainerView, VmReleaseListItem} from './migration-timeline.interface';
import {baseURL} from './migration-timeline.module';
import {formatSemVerNumber, parseMigrationItemSubjectUID, parseMigrationItemUID} from './utils/formatter-parser';
import {flattener} from './utils/general';
import {LocalState} from './utils/local-state.service';
import {closestRelevantVersion, latestRelevantVersion} from './utils/operators';

@Inject({})
export class MigrationTimelineContainerAdapter extends LocalState<VmMigrationTimelineContainerView> {
  private baseURL = baseURL;

  m$ = this.select();

  // selectedMigrationReleaseUIDChange from UI or URL
  selectedMigrationReleaseUIDChangeConnector = flattener<string>();

  constructor(
    private migrationService: MigrationTimelineService,
    private locationService: LocationService
  ) {
    super();
    // (re)fetch data  over http request
    this.migrationService.fetchMigrationTimeline();

    // Connect Router to selectedMigrationReleaseUIDChange
    const _selectedMigrationItemUidUrlChange$ = this.locationService.currentHash.pipe(filter(v => !!v));
    const _selectedMigrationReleaseUidUrlChange$ = _selectedMigrationItemUidUrlChange$.pipe(
      map((h: string): string => h.split('_')[0]),
      shareReplay(1)
    );
    this.selectedMigrationReleaseUIDChangeConnector.add(_selectedMigrationReleaseUidUrlChange$);


    // Global state to view view state
    const _parsedMigrationList$ = this.migrationService.migrations$
      .pipe(this.parseVmReleaseItemList());
    this.connectSlice('releaseList', _parsedMigrationList$);
    this.connectSlice('releaseNavigation', _parsedMigrationList$.pipe(map(this.parseVmReleaseNavigation)));

    const _closestRelevantVersion$: Observable<string> = _selectedMigrationReleaseUidUrlChange$
      .pipe(closestRelevantVersion(_parsedMigrationList$));
    const _latestRelevantVersionToNow$: Observable<string> = of(new Date())
      .pipe(latestRelevantVersion(_parsedMigrationList$));

    // Initial version form 'URL hash or date
    const _initialVersion$: Observable<string> = _selectedMigrationItemUidUrlChange$
      .pipe(
        switchMap((hash: string) => hash === undefined ? _latestRelevantVersionToNow$ : _closestRelevantVersion$),
        take(1)
      );

    //
    const selectedMigrationReleaseUIDChange$ = this.selectedMigrationReleaseUIDChangeConnector.changes$;
    this.connectSlice('selectedMigrationReleaseUID',
      merge(selectedMigrationReleaseUIDChange$, _initialVersion$
      // @TODO ugly hack for non controlled scrolling
        .pipe(delay(200)))
    );

    // Router  =====================

    // currentHash changed
    this.connectSlice(_selectedMigrationItemUidUrlChange$
      .pipe(
        map(currentHash => currentHash.split('_')),
        map(([selectedMigrationReleaseUID, selectedMigrationItemSubjectUID]) =>
          ({selectedMigrationReleaseUID, selectedMigrationItemSubjectUID})))
    );

    // selectedMigrationReleaseUIDChange fired
    this.connectEffect(selectedMigrationReleaseUIDChange$.pipe(
      distinctUntilChanged(),
      tap(v => this.locationService.go(this.baseURL + '#' + v))
    ));

  }

  private parseVmReleaseItemList() {
    return map((list: ClientRelease[]) => list.map((r: ClientRelease): VmReleaseListItem => {
      return {
        ...r,
        version: r.version,
        officialRelease: r.version.split('-').length < 2,
        versionNumber: formatSemVerNumber(r.version),
        deprecations: this.parseToMigrationItemUIDAware(r.deprecations, r.version),
        breakingChanges: this.parseToMigrationItemUIDAware(r.breakingChanges, r.version),
      };
    }));
  }

  private parseToMigrationItemUIDAware<T>(deprecations: T[], version): Array<T & MigrationItemUIDAware> {
    return deprecations.map((i: any) => {
      return {
        ...i,
        migrationReleaseUID: formatSemVerNumber(version) + '',
        migrationItemSubjectUID: parseMigrationItemSubjectUID(i, {}),
        migrationItemUID: parseMigrationItemUID(i, {version})
      };
    });
  }

  private parseVmReleaseNavigation(releases: VmReleaseListItem[]): VmReleaseNavigationItem[] {
    return releases.reduce((res: VmReleaseNavigationItem[], release): VmReleaseNavigationItem[] => {
      const navigationItem: VmReleaseNavigationItem = {
        date: release.date,
        version: release.version,
        versionNumber: release.versionNumber,
        officialRelease: release.officialRelease
      };
      res.push(navigationItem);
      return res;
    }, []);
  }

}
