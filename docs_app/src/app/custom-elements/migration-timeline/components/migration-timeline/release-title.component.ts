import {ChangeDetectionStrategy, Component, Input, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {Release} from '../../data-access';

@Component({
  // tslint:disable-next-line:component-selector
  selector: `rxjs-release-title`,
  template: `

  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReleaseTitleComponent {

  _release: Release;
  @Input()
  set release(release: Release) {
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
