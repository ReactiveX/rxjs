import { root } from './root';
import MapPolyfill from './MapPolyfill';

export default root.Map || (() => MapPolyfill)();