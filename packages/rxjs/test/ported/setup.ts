const mode = process.env.RXJS_NEXT_TEST_MODE ?? 'cold';

if (mode === 'cold' || mode === 'polyfill') {
  await import('../../../observable-polyfill/src/index.js');
}
