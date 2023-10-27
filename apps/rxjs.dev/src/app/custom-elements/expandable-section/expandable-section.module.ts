import { NgModule, Type } from '@angular/core';
import { ExpandableSectionComponent } from './expandable-section.component.js';
import { WithCustomElementComponent } from '../element-registry.js';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  imports: [MatExpansionModule],
  declarations: [ExpandableSectionComponent],
})
export class ExpandableSectionModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = ExpandableSectionComponent;
}
