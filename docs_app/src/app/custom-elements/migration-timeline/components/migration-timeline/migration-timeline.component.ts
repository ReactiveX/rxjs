import {ChangeDetectionStrategy, Component, Input, Output} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {environment} from '../../../../../environments/environment';
import {State} from '../../../../shared/state.service';
import {Release, parseMigrationReleaseUIDFromString} from '../../data-access';

export interface MigrationTimelineComponentViewBaseModel {
  releaseList: Release[];
  selectedMigrationReleaseUID: string;
  selectedMigrationItemUID: string;
}

@Component({
  selector: `rxjs-migration-timeline`,
  templateUrl: `./migration-timeline.component.html`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MigrationTimelineComponent extends State<MigrationTimelineComponentViewBaseModel> {
  env = environment;

  @Input()
  set releaseList(releaseList: Release[]) {
    if (releaseList) {
      this.setState({releaseList});
    }
  }

  @Input()
  set selectedMigrationItemUID(selectedMigrationItemUID: string) {
    this.setState({
      selectedMigrationItemUID: selectedMigrationItemUID || '',
      selectedMigrationReleaseUID: parseMigrationReleaseUIDFromString(selectedMigrationItemUID)
    });
  }

  @Output()
  selectedMigrationReleaseUIDChange = new Subject<string>();

  @Output()
  selectedMigrationItemUIDChange = new Subject<string>();

  vm$ = this.select();
  expandedRelease$: Observable<{ [version: string]: boolean }> = this.select('selectedMigrationItemUID')
    .pipe(
      map((version: string) => ({[parseMigrationReleaseUIDFromString(version)]: true})),
      startWith({})
    );

  constructor() {
    super();
  }
}
