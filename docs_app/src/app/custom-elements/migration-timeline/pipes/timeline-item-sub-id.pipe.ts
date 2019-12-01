import {Pipe, PipeTransform} from '@angular/core';
import {BreakingChange, Deprecation} from '../data-access/interfaces';
import {getItemSubId} from '../utils/operators';

@Pipe({
  name: 'timelineItemSubId'
})
export class TimelineItemSubIdPipe implements PipeTransform {

  transform(item: Deprecation | BreakingChange, args: { link?: string }): any {
    return getItemSubId(item, args);
  }

}
