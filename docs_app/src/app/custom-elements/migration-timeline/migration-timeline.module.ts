import {CommonModule} from '@angular/common';
import {NgModule, Type} from '@angular/core';
import {MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, MatExpansionModule} from '@angular/material';
import {CodeExampleModule} from '../code/code-example.module';
import {WithCustomElementComponent} from '../element-registry';
import {BreakingChangeDescriptionTableComponent} from './components/breaking-change-description-table.component';
import {DeprecationDescriptionTableComponent} from './components/deprecation-description-table.component';
import {MigrationTimelineComponent} from './components/migration-timeline.component';
import {MigrationTimelineService} from './data-access/migration-timeline.service';
import {MigrationTimelineContainerComponent} from './migration-timeline.container.component';

@NgModule({
  imports: [
    CommonModule,
    CodeExampleModule,
    MatChipsModule, MatCardModule, MatExpansionModule,
    MatCardModule, MatButtonModule, MatIconModule
  ],
  declarations: [
    MigrationTimelineContainerComponent,
    MigrationTimelineComponent, DeprecationDescriptionTableComponent,
    BreakingChangeDescriptionTableComponent
  ],
  entryComponents: [MigrationTimelineContainerComponent],
  providers: [MigrationTimelineService]
})
export class MigrationTimelineModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = MigrationTimelineContainerComponent;
}
