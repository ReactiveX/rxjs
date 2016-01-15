/**
 * This file was created manually, hence not managed by the 'tools/generate-operator-patches.ts' script.
 **/
import {Observable} from '../../Observable';
import {ArrayObservable} from '../../observable/fromArray';

Observable.of = ArrayObservable.of;

export var _void: void;
