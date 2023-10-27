import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceListComponent } from './resource-list.component.js';
import { ResourceService } from './resource.service.js';
import { WithCustomElementComponent } from '../element-registry.js';

@NgModule({
  imports: [CommonModule],
  declarations: [ResourceListComponent],
  providers: [ResourceService],
})
export class ResourceListModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = ResourceListComponent;
}
