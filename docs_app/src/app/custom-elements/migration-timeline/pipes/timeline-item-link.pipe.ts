import {Pipe, PipeTransform} from '@angular/core';
import {BreakingChange, Deprecation, TimeLineTypes} from '../data-access/interfaces';
import {getItemHash} from '../utils/operators';

@Pipe({
  name: 'timelineItemLink'
})
export class TimelineItemLinkPipe implements PipeTransform {
  transform(item: Deprecation | BreakingChange, args: { version: string, type?: TimeLineTypes, link?: string }): any {
    getItemHash(item, args);
  }
}
