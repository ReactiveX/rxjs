import fs from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { hashBuffer, hashFile } from './hash.mjs';
import { polyfillSourcePath, repoRoot } from './paths.mjs';

function createPolyfillPrelude({ config, sourceSha256 }) {
  const installationKey = JSON.stringify(config.attestation.installationKey);
  const requireNative = JSON.stringify(config.browser.requireNativeObservable);
  const sourceHash = JSON.stringify(sourceSha256);

  return `(() => {
  "use strict";
  const installationKey = ${installationKey};
  const sourceSha256 = ${sourceHash};
  const existing = globalThis[installationKey];
  if (existing !== undefined) {
    if (
      existing.sourceSha256 !== sourceSha256 ||
      globalThis.Observable !== existing.installedObservable ||
      globalThis.Observable?.prototype?.subscribe !== existing.installedSubscribe ||
      globalThis.EventTarget?.prototype?.when !== existing.installedWhen
    ) {
      throw new Error("Conflicting or inactive RxJS WPT installation");
    }
  } else {
    const nativeObservable = globalThis.Observable;
    const nativeSubscribe = nativeObservable?.prototype?.subscribe;
    const eventTargetPrototype = globalThis.EventTarget?.prototype;
    const nativeWhen = eventTargetPrototype?.when;
    const observableDescriptor = Object.getOwnPropertyDescriptor(globalThis, "Observable");
    const whenDescriptor = eventTargetPrototype && Object.getOwnPropertyDescriptor(eventTargetPrototype, "when");

    if (${requireNative} && (typeof nativeObservable !== "function" || typeof nativeSubscribe !== "function")) {
      throw new Error("Pinned WPT browser did not expose a native Observable in this realm");
    }
    if (${requireNative} && (eventTargetPrototype === undefined || typeof nativeWhen !== "function")) {
      throw new Error("Pinned WPT browser did not expose native EventTarget.prototype.when in this realm");
    }

    const maskProperty = (owner, key, descriptor, label) => {
      if (descriptor?.configurable) {
        if (!Reflect.deleteProperty(owner, key)) {
          throw new Error("Could not remove native " + label);
        }
        return;
      }
      if (descriptor && "writable" in descriptor && descriptor.writable) {
        if (!Reflect.set(owner, key, undefined)) {
          throw new Error("Could not mask native " + label);
        }
        return;
      }
      throw new Error("Native " + label + " is neither configurable nor writable");
    };

    maskProperty(globalThis, "Observable", observableDescriptor, "Observable");
    maskProperty(eventTargetPrototype, "when", whenDescriptor, "EventTarget.prototype.when");
`;
}

function createPolyfillFooter({ config, sourceSha256 }) {
  const installationKey = JSON.stringify(config.attestation.installationKey);
  const sourceHash = JSON.stringify(sourceSha256);

  return `
    const installedObservable = globalThis.Observable;
    const installedSubscribe = installedObservable?.prototype?.subscribe;
    const installedWhen = globalThis.EventTarget?.prototype?.when;
    if (
      typeof installedObservable !== "function" ||
      typeof installedSubscribe !== "function" ||
      typeof installedWhen !== "function"
    ) {
      throw new Error("RxJS WPT bundle did not install the complete fallback surface");
    }

    const installation = Object.freeze({
      sourceSha256: ${sourceHash},
      nativeObservable,
      nativeSubscribe,
      nativeWhen,
      observableDescriptor,
      whenDescriptor,
      installedObservable,
      installedSubscribe,
      installedWhen,
    });
    Object.defineProperty(globalThis, ${installationKey}, {
      value: installation,
      configurable: false,
      enumerable: false,
      writable: false,
    });
  }
})();`;
}

function createAttestationInstaller({ config, bundleSha256 }) {
  const installationKey = JSON.stringify(config.attestation.installationKey);
  const functionKey = JSON.stringify(config.attestation.functionKey);
  const expectedBundleSha = JSON.stringify(bundleSha256);

  return `((targetGlobal, expectedBundleSha, installationKey, functionKey) => {
  "use strict";
  const existingAttestation = targetGlobal[functionKey];
  if (existingAttestation !== undefined) {
    const existingResult = existingAttestation();
    if (existingResult.bundleSha256 !== expectedBundleSha) {
      throw new Error("Conflicting RxJS WPT attestation bundle");
    }
    return;
  }

  const installation = targetGlobal[installationKey];
  if (installation === undefined) {
    throw new Error("RxJS WPT installation record is missing");
  }

  const attest = () => {
    const checks = Object.freeze({
      nativeObservableWasPresent:
        typeof installation.nativeObservable === "function" &&
        typeof installation.nativeSubscribe === "function",
      nativeWhenWasPresent: typeof installation.nativeWhen === "function",
      observableIsInstalled: targetGlobal.Observable === installation.installedObservable,
      subscribeIsInstalled:
        targetGlobal.Observable?.prototype?.subscribe === installation.installedSubscribe,
      whenIsInstalled:
        targetGlobal.EventTarget?.prototype?.when === installation.installedWhen,
      observableIsNotNative:
        installation.installedObservable !== installation.nativeObservable &&
        targetGlobal.Observable !== installation.nativeObservable,
      subscribeIsNotNative:
        installation.installedSubscribe !== installation.nativeSubscribe &&
        targetGlobal.Observable?.prototype?.subscribe !== installation.nativeSubscribe,
      whenIsNotNative:
        installation.installedWhen !== installation.nativeWhen &&
        targetGlobal.EventTarget?.prototype?.when !== installation.nativeWhen,
    });
    return Object.freeze({
      ok: Object.values(checks).every(Boolean),
      bundleSha256: expectedBundleSha,
      sourceSha256: installation.sourceSha256,
      realm: typeof targetGlobal.document === "object" ? "window" : "worker",
      checks,
    });
  };

  Object.defineProperty(targetGlobal, functionKey, {
    value: attest,
    configurable: false,
    enumerable: false,
    writable: false,
  });
})(
  globalThis,
  ${expectedBundleSha},
  ${installationKey},
  ${functionKey}
);`;
}

function createBootstrap({ config, installerSource, attestationInstallerSource, bundleSha256 }) {
  const functionKey = JSON.stringify(config.attestation.functionKey);
  const iframePatchKey = JSON.stringify(config.attestation.iframePatchKey);
  const realmStateKey = JSON.stringify(config.attestation.realmStateKey);
  const expectedBundleSha = JSON.stringify(bundleSha256);
  const serializedInstaller = JSON.stringify(installerSource);
  const serializedAttestationInstaller = JSON.stringify(attestationInstallerSource);
  const iframeTestRequirements = JSON.stringify(
    Object.fromEntries(
      Object.entries(config.reviewedIframeFiles)
        .map(([filePath, review]) => [`/${filePath.replace(/\.window\.js$/, '.window.html')}`, review.childRealmCount])
        .sort(([left], [right]) => left.localeCompare(right))
    )
  );

  return `(() => {
  "use strict";
  const installerSource = ${serializedInstaller};
  const attestationInstallerSource = ${serializedAttestationInstaller};
  const functionKey = ${functionKey};
  const expectedBundleSha = ${expectedBundleSha};
  const iframeTestRequirements = new Map(Object.entries(${iframeTestRequirements}));
  const realmStateKey = ${realmStateKey};

  const verify = (targetGlobal, label) => {
    const attest = targetGlobal[functionKey];
    if (typeof attest !== "function") {
      throw new Error(label + ": RxJS WPT attestation function is missing");
    }
    const result = attest();
    if (!result.ok || result.bundleSha256 !== expectedBundleSha) {
      throw new Error(label + ": RxJS WPT identity check failed: " + JSON.stringify(result));
    }
    return result;
  };

  (0, eval)(installerSource);
  (0, eval)(attestationInstallerSource);
  const currentRealm = verify(globalThis, "current realm");
  const requiredSameOriginIframeCount =
    typeof location === "object" ? iframeTestRequirements.get(location.pathname) ?? 0 : 0;
  const childListeners = [];
  const childRealms = [];
  let childRealmsReady = false;
  const notifyChildListeners = () => {
    if (childRealmsReady) {
      return;
    }
    childRealmsReady =
      childRealms.some((result) => result.ok !== true) ||
      childRealms.length === requiredSameOriginIframeCount;
    if (childRealmsReady) {
      const results = Object.freeze([...childRealms]);
      for (const listener of childListeners.splice(0)) {
        listener(results);
      }
    }
  };
  const realmState = Object.freeze({
    currentRealm,
    requiredSameOriginIframeCount,
    onChildRealmsReady(callback) {
      if (childRealmsReady) {
        callback(Object.freeze([...childRealms]));
      } else {
        childListeners.push(callback);
      }
    },
    recordChild(result) {
      childRealms.push(Object.freeze(result));
      notifyChildListeners();
    },
  });
  Object.defineProperty(globalThis, realmStateKey, {
    value: realmState,
    configurable: false,
    enumerable: false,
    writable: false,
  });

  if (typeof document !== "object" || typeof HTMLIFrameElement !== "function") {
    return;
  }

  const iframePrototype = HTMLIFrameElement.prototype;
  const iframePatchKey = ${iframePatchKey};
  const existingPatch = iframePrototype[iframePatchKey];
  if (existingPatch !== undefined) {
    if (existingPatch.bundleSha256 !== expectedBundleSha) {
      throw new Error("Conflicting RxJS WPT iframe patch");
    }
    return;
  }

  const descriptor = Object.getOwnPropertyDescriptor(iframePrototype, "contentWindow");
  if (!descriptor?.configurable || typeof descriptor.get !== "function") {
    throw new Error("HTMLIFrameElement.prototype.contentWindow cannot be attested");
  }

  const originalGetter = descriptor.get;
  Object.defineProperty(iframePrototype, "contentWindow", {
    ...descriptor,
    get() {
      const childWindow = originalGetter.call(this);
      if (childWindow !== null) {
        try {
          childWindow.eval(installerSource);
          childWindow.eval(attestationInstallerSource);
          realmState.recordChild(verify(childWindow, "same-origin iframe"));
        } catch (error) {
          realmState.recordChild({
            ok: false,
            bundleSha256: expectedBundleSha,
            realm: "same-origin iframe",
            error: String(error),
          });
          throw new Error("Could not install the RxJS WPT bundle in a same-origin iframe", {
            cause: error,
          });
        }
      }
      return childWindow;
    },
  });
  Object.defineProperty(iframePrototype, iframePatchKey, {
    value: Object.freeze({ bundleSha256: expectedBundleSha }),
    configurable: false,
    enumerable: false,
    writable: false,
  });
})();`;
}

function createAttestationTest({ config, bundleSha256 }) {
  const functionKey = JSON.stringify(config.attestation.functionKey);
  const registrationKey = JSON.stringify(`${config.attestation.functionKey}_REGISTER_TEST__`);
  const realmStateKey = JSON.stringify(config.attestation.realmStateKey);
  const expectedBundleSha = JSON.stringify(bundleSha256);
  const testName = JSON.stringify(`${config.attestation.namePrefix}${bundleSha256} is active`);

  return `(() => {
  let registered = false;
  const assertRealm = (result, label) => {
    assert_equals(result?.bundleSha256, ${expectedBundleSha}, label + " has the expected RxJS bundle");
    assert_true(result?.ok === true, label + " has exact RxJS identities: " + JSON.stringify(result));
  };
  const assertCurrentRealm = () => {
  const attest = globalThis[${functionKey}];
  assert_equals(typeof attest, "function", "The test-only attestation function exists");
  const result = attest();
    assertRealm(result, "The current realm");
  };
  const realmState = globalThis[${realmStateKey}];

  const register = () => {
    if (registered) {
      throw new Error("RxJS WPT attestation test was registered more than once");
    }
    registered = true;
    if (realmState?.requiredSameOriginIframeCount > 0) {
      const attestationTest = async_test(${testName});
      realmState.onChildRealmsReady(
        attestationTest.step_func((childResults) => {
          assertCurrentRealm();
          assert_equals(
            childResults.length,
            realmState.requiredSameOriginIframeCount,
            "Every reviewed same-origin iframe realm was reached"
          );
          childResults.forEach((childResult, index) => {
            assertRealm(childResult, "Same-origin iframe realm " + (index + 1));
          });
          attestationTest.done();
        })
      );
      return;
    }
    test(assertCurrentRealm, ${testName});
  };

  Object.defineProperty(globalThis, ${registrationKey}, {
    value: register,
    configurable: false,
    enumerable: false,
    writable: false,
  });
})();
`;
}

export async function buildHarnessBundles({ config, outputRoot }) {
  const sourceSha256 = await hashFile(polyfillSourcePath);
  const buildResult = await build({
    entryPoints: [polyfillSourcePath],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: ['chrome135'],
    legalComments: 'none',
    banner: { js: createPolyfillPrelude({ config, sourceSha256 }) },
    footer: { js: createPolyfillFooter({ config, sourceSha256 }) },
  });

  if (buildResult.outputFiles.length !== 1) {
    throw new Error(`Expected one RxJS WPT bundle, received ${buildResult.outputFiles.length}`);
  }

  const installerSource = buildResult.outputFiles[0].text;
  const bundleSha256 = hashBuffer('sha256', installerSource);
  const attestationInstallerSource = createAttestationInstaller({ config, bundleSha256 });
  const bootstrapSource = createBootstrap({
    config,
    installerSource,
    attestationInstallerSource,
    bundleSha256,
  });
  const attestationTestSource = createAttestationTest({ config, bundleSha256 });

  await fs.mkdir(outputRoot, { recursive: true });
  await fs.writeFile(path.join(outputRoot, 'rxjs-under-test.js'), installerSource);
  await fs.writeFile(path.join(outputRoot, 'wpt-bootstrap.js'), bootstrapSource);
  await fs.writeFile(path.join(outputRoot, 'attestation-test.js'), attestationTestSource);

  const manifest = {
    schemaVersion: 1,
    implementationId: bundleSha256,
    bundleSha256,
    sourceFiles: [
      {
        path: path.relative(repoRoot, polyfillSourcePath).split(path.sep).join('/'),
        sha256: sourceSha256,
      },
    ],
  };
  await fs.writeFile(path.join(outputRoot, 'bundle-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}
