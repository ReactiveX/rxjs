/* Test file to ensure rxjs can be loaded from esm

https://github.com/ReactiveX/rxjs/pull/6192
If this fails node will error when running this with an error like
node:internal/process/esm_loader:74
    internalBinding('errors').triggerUncaughtException(
*/
import {Observable} from 'rxjs';
import * as o from 'rxjs/operators';
import * as a from 'rxjs/ajax';
import * as f from 'rxjs/fetch';
import * as t from 'rxjs/testing';
import * as w from 'rxjs/webSocket';
