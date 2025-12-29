// Client-side code to verify CSS variables are in DOM
// #region agent log
fetch('http://127.0.0.1:7243/ingest/8b80e126-75f5-4582-90a8-cc86cfd529e2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'theme/client.ts:1', message: 'Client script executing', data: { timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
// #endregion

export default {
  onMounted() {
    // #region agent log
    const checkVars = () => {
      const root = document.documentElement;
      const computed = getComputedStyle(root);
      const brand1 = computed.getPropertyValue('--vp-c-brand-1').trim();
      const debugTest = computed.getPropertyValue('--debug-test-color').trim();
      fetch('http://127.0.0.1:7243/ingest/8b80e126-75f5-4582-90a8-cc86cfd529e2', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'theme/client.ts:8', message: 'CSS variables check', data: { brand1, brand1Found: brand1 === '#EE1090' || brand1 === 'rgb(238, 16, 144)', debugTest, debugTestFound: debugTest === '#EE1090' || debugTest === 'rgb(238, 16, 144)', allStyleSheets: Array.from(document.styleSheets).map(s => s.href || 'inline'), timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
    };
    // #endregion

    // Check immediately and after a short delay
    checkVars();
    setTimeout(checkVars, 100);
    setTimeout(checkVars, 500);
  }
}


