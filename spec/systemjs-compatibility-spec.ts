// all these imports verify that our ESM imports and exports are SystemJS compatible after transpilation
// this is done by relying on the tsc type-checker configured with "moduleResolution" set to "classic"
import * as rxjs from '../src/index';
import * as rxjsAjax from '../src/ajax';
import * as rxjsOperators from '../src/operators';
import * as rxjsTesting from '../src/testing';
import * as rxjsWebsocket from '../src/websocket';
