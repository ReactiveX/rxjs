import {CommonModule} from '@angular/common';
import {NgModule, Type} from '@angular/core';
import {MatChipsModule, MatCardModule} from '@angular/material';
import {WithCustomElementComponent} from '../element-registry';
import {MigrationTimelineService} from './data-access/migration-timeline.service';
import {MigrationTimelineComponent} from './migration-timeline.component';

@NgModule({
  imports: [CommonModule, MatChipsModule, MatCardModule],
  declarations: [MigrationTimelineComponent],
  entryComponents: [MigrationTimelineComponent],
  providers: [MigrationTimelineService]
})
export class MigrationTimelineModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = MigrationTimelineComponent;
}
