import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: `rxjs-shield`,
  template: `
    <div class="shield">
      <span class="label">{{_label}}</span>
      <span class="version">{{_version}}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShieldComponent {

  _label: string;
  @Input()
  set label(label: string) {
    if (label) {
      this._label = label;
    }
  }

  _version: string;
  @Input()
  set version(version: string) {
    if (version) {
      this._version = version;
    }
  }

}
