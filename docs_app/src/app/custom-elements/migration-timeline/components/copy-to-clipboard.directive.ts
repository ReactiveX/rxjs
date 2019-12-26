import {Directive, HostListener, Input} from '@angular/core';
import {LocalState} from '../utils/local-state.service';

@Directive({
  selector: '[copy-to-clipboard]'
})
export class CopyToClipboardDirective extends LocalState<{ text: string, description: string }> {

  @Input()
  set text(text: string) {
    this.setState({text});
  }

  @Input()
  set description(description: string) {
    this.setState({description});
  }

  @HostListener('click')
  hostClick() {
    console.log('HostListener click');
  }

  constructor() {
    super();
  }

}
