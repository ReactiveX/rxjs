import assert from 'node:assert/strict';
import { buildReleaseBrowserBundle, createReleaseContractScript, extensionKernelCaseNames } from './browser-contract.mjs';
import { createSafariSession, deleteSafariSession, executeSafariScript, withSafariDriver } from './safari-driver.mjs';

const target = process.argv[2];
if (target !== 'desktop' && target !== 'ios') {
  throw new Error('Usage: node test/release/safari.mjs <desktop|ios>');
}

const bundle = await buildReleaseBrowserBundle();
const result = await withSafariDriver(async (baseUrl) => {
  const session = await createSafariSession(baseUrl, target);
  try {
    await executeSafariScript(baseUrl, session.sessionId, bundle);
    const contractResult = await executeSafariScript(baseUrl, session.sessionId, createReleaseContractScript(), [], {
      asynchronous: true,
    });
    assert.equal(contractResult?.error, undefined, contractResult?.error);
    assert.deepEqual(contractResult?.completedCases, extensionKernelCaseNames);
    return {
      target,
      browserName: session.capabilities.browserName,
      browserVersion: session.capabilities.browserVersion,
      platformName: session.capabilities.platformName,
      implementation: contractResult.implementation,
    };
  } finally {
    await deleteSafariSession(baseUrl, session.sessionId);
  }
});

console.log(JSON.stringify(result));
