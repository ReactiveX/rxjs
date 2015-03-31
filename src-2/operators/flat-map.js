import map from './map';
import mergeAll from './merge-all';

export default (selector, obs, dest) => {
    
    if(typeof selector !== "function") {
        obs = selector;
        selector = () => { return obs; };
    }
    
    return map(selector, mergeAll(undefined, dest));
}