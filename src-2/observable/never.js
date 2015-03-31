import Observable from '../Observable';
import noop from '../support/noop';

var staticNever = new Observable(noop);

export default () => { return staticNever; };