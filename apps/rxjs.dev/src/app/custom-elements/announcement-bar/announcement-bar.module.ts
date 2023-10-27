import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared/shared.module.js';
import { AnnouncementBarComponent } from './announcement-bar.component.js';
import { WithCustomElementComponent } from '../element-registry.js';

@NgModule({
  imports: [CommonModule, SharedModule, HttpClientModule],
  declarations: [AnnouncementBarComponent],
})
export class AnnouncementBarModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = AnnouncementBarComponent;
}
