import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared/shared.module.js';
import { ApiListComponent } from './api-list.component.js';
import { ApiService } from './api.service.js';
import { WithCustomElementComponent } from '../element-registry.js';

@NgModule({
  imports: [CommonModule, SharedModule, HttpClientModule],
  declarations: [ApiListComponent],
  providers: [ApiService],
})
export class ApiListModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = ApiListComponent;
}
