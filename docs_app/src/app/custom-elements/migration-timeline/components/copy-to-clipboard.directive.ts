import {Directive, HostListener, Input} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {Subject} from 'rxjs';
import {filter, map, tap, withLatestFrom} from 'rxjs/operators';
import {CopierService} from '../../../shared/copier.service';
import {State} from '../../../shared/state.service';

@Directive({
  selector: '[rxjs-copy-to-clipboard]'
})
export class CopyToClipboardDirective extends State<{ title: string, content: string }> {
  hostClick$ = new Subject<Event>();

  private truthyContent$ = this.select('content')
    .pipe(filter(v => v !== null && v !== undefined));

  private copyToClipBoardEffect$ = this.hostClick$
    .pipe(
      withLatestFrom(this.truthyContent$),
      map(([_, c]) => c),
      tap((content) => this.saveContent(content))
    );

  @Input()
  set title(title: string) {
    this.set({title});
  }

  @Input()
  set content(content: string) {
    this.set({content});
  }

  @HostListener('click')
  hostClick(event: Event) {
    this.hostClick$.next(event);
  }

  constructor(private copier: CopierService, private snackbar: MatSnackBar) {
    super();
    this.set({title: 'Copy to clipboard'});
    this.hold(this.copyToClipBoardEffect$);
  }

  saveContent(content: string): void {
    const successfullyCopied = this.copier.copyText(content);
    if (successfullyCopied) {
      this.snackbar.open('Copied to clipboard', '', {duration: 800});
    } else {
      this.snackbar.open('Copy failed. Please try again!', '', {duration: 800});
    }
  }

}
