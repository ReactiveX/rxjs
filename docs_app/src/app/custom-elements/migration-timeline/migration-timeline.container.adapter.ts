import {Inject} from '@angular/core';
import {merge, Observable, of, Subject} from 'rxjs';
import {delay, distinctUntilChanged, filter, map, mergeAll, shareReplay, switchMap, take, tap} from 'rxjs/operators';
import {LocationService} from '../../shared/location.service';
import {ClientRelease} from './data-access/interfaces';
import {MigrationTimelineService} from './data-access/migration-timeline.service';
import {VmReleaseListItem, VmReleaseNavigationItem, VmTimelineContainerView} from './migration-timeline.interface';
import {baseURL} from './migration-timeline.module';
import {LocalState} from './utils/local-state.service';
import {closestRelevantVersion, formatSemVerNumber, getItemHash, latestRelevantVersion} from './utils/operators';

@Inject({})
export class MigrationTimelineContainerAdapter extends LocalState<VmTimelineContainerView> {
  private baseURL = baseURL;

  releaseList$ = this.select('releaseList');
  releaseNavigation$ = this.select('releaseNavigation');
  selectedVersion$ = this.select('selectedVersion');
  selectedVersionChange = flattener<string>();
  selectedVersionChange$ = this.selectedVersionChange.changes$;

  constructor(
    private migrationService: MigrationTimelineService,
    private locationService: LocationService
  ) {
    super();
    // (re)fetch data  over http request
    this.migrationService.fetchMigrationTimeline();

    // Global state to view view state
    const _parsedMigrationList$ = this.migrationService.migrations$
      .pipe(this.parseVmReleaseItemList());

    this.connectSlice('releaseList', _parsedMigrationList$);
    this.connectSlice('releaseNavigation', _parsedMigrationList$.pipe(map(this.parseVmReleaseNavigation)));

    // ROUTER
    const _currentHash$ = this.locationService.currentHash.pipe(filter(v => !!v));
    const _URLVersion$ = _currentHash$.pipe(
      map((h: string): string => h.split('_')[0]),
      shareReplay(1)
    );
    this.selectedVersionChange.add(_URLVersion$);

    const _closestRelevantVersion$: Observable<string> = _URLVersion$
      .pipe(closestRelevantVersion(_parsedMigrationList$));
    const _latestRelevantVersionToNow$: Observable<string> = of(new Date())
      .pipe(latestRelevantVersion(_parsedMigrationList$));

    // Initial version form 'URL hash or date
    const _initialVersion$: Observable<string> = _currentHash$
      .pipe(
        switchMap((hash: string) => hash === undefined ? _latestRelevantVersionToNow$ : _closestRelevantVersion$),
        take(1)
      );

    this.connectSlice('selectedVersion',
      merge(this.selectedVersionChange$, _initialVersion$
      // @TODO ugly hack for non controlled scrolling
        .pipe(delay(200)))
    );

    // Router  =====================

    // currentHash changed
    this.connectSlice(_currentHash$
      .pipe(
        map(currentHash => currentHash.split('_')),
        map(([selectedVersion, itemSubId]) => ({selectedVersion, itemSubId}))));

    // selectedVersionChange fired
    this.connectEffect(this.selectedVersionChange$.pipe(
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
        deprecations: r.deprecations.map(d => ({...d, itemHash: getItemHash(d, {version: r.version})})),
        breakingChanges: r.breakingChanges.map(d => ({...d, itemHash: getItemHash(d, {version: r.version})})),
      };
    }));
  }

  parseVmReleaseNavigation(releases: VmReleaseListItem[]): VmReleaseNavigationItem[] {
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

function flattener<T>(): { add: (o: Observable<T>) => void, changes$: Observable<T> } {
  const _subject = new Subject<Observable<T>>();
  const changes$ = _subject.pipe(mergeAll());
  return {
    add: (o: Observable<T>): void => {
      _subject.next(o);
    },
    changes$
  };

}

