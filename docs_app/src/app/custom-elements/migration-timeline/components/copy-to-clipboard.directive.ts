import {Directive, HostListener, Input} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {Subject} from 'rxjs';
import {filter, map, tap, withLatestFrom} from 'rxjs/operators';
import {CopierService} from '../../../shared/copier.service';
import {State} from '../utils/state.service';

@Directive({
  selector: '[copy-to-clipboard]'
})
export class CopyToClipboardDirective extends State<{ title: string, content: string }> {
  hostClick$ = new Subject<Event>();

  copyToClipBoardEffect$ = this.hostClick$
    .pipe(
      withLatestFrom(this.select('content')),
      map(([_, content]) => content),
      filter(v => v !== null && v !== undefined),
      tap((content) => {
        const successfullyCopied = this.copier.copyText(content);
        if (successfullyCopied) {
          this.snackbar.open('Copied to clipboard', '', {duration: 800});
        } else {
          this.snackbar.open('Copy failed. Please try again!', '', {duration: 800});
        }
      })
    );

  @Input()
  set title(title: string) {
    this.setState({title});
  }

  @Input()
  set content(content: string) {
    this.setState({content});
  }

  @HostListener('click')
  hostClick(event: Event) {
    this.hostClick$.next(event);
  }

  constructor(private copier: CopierService, private snackbar: MatSnackBar) {
    super();
    this.setState({title: 'Copy to clipboard'});
    this.holdEffect(this.copyToClipBoardEffect$);
  }

}
