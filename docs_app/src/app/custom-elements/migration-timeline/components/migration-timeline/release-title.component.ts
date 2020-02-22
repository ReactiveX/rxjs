import {ChangeDetectionStrategy, Component, Input, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {ClientMigrationTimelineReleaseItem} from '../../data-access';

@Component({
  selector: `release-title`,
  template: `

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
