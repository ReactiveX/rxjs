import {CommonModule} from '@angular/common';
import {NgModule, Type} from '@angular/core';
import {MatChipsModule, MatCardModule, MatExpansionModule, MatButtonModule} from '@angular/material';
import {WithCustomElementComponent} from '../element-registry';
import {MigrationTimelineService} from './data-access/migration-timeline.service';
import {MigrationTimelineComponent} from './components/migration-timeline.component';
import { MigrationTimelineContainerComponent } from './migration-timeline.container.component';

@NgModule({
  imports: [
    CommonModule,
    MatChipsModule, MatCardModule, MatExpansionModule,
    MatCardModule, MatButtonModule
  ],
  declarations: [MigrationTimelineContainerComponent, MigrationTimelineComponent],
  entryComponents: [MigrationTimelineContainerComponent],
  providers: [MigrationTimelineService]
})
export class MigrationTimelineModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = MigrationTimelineContainerComponent;
}
