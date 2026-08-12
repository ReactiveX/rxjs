import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

export function safariCapabilities(target, { deviceUdid = process.env.RXJS_SAFARI_DEVICE_UDID } = {}) {
  if (target === 'desktop') {
    return { alwaysMatch: { browserName: 'Safari' } };
  }
  if (target === 'ios') {
    return {
      alwaysMatch: {
        browserName: 'Safari',
        platformName: 'iOS',
        'safari:useSimulator': true,
        ...(deviceUdid ? { 'safari:deviceUDID': deviceUdid } : {}),
      },
    };
  }
  throw new Error(`Unknown Safari target ${target}. Expected desktop or ios.`);
}

export async function withSafariDriver(run, { port = 4444 } = {}) {
  const configuredUrl = process.env.RXJS_SAFARIDRIVER_URL;
  if (configuredUrl) return run(configuredUrl.replace(/\/$/, ''));

  const driver = spawn('safaridriver', ['-p', String(port)], { stdio: ['ignore', 'pipe', 'pipe'] });
  let diagnostics = '';
  driver.stdout.on('data', (chunk) => (diagnostics += chunk));
  driver.stderr.on('data', (chunk) => (diagnostics += chunk));

  try {
    const baseUrl = `http://127.0.0.1:${port}`;
    await waitForDriver(baseUrl, { getDiagnostics: () => diagnostics });
    return await run(baseUrl);
  } finally {
    driver.kill('SIGTERM');
  }
}

export async function createSafariSession(baseUrl, target) {
  const response = await retrySafariSession(
    () =>
      request(baseUrl, '/session', {
        method: 'POST',
        body: JSON.stringify({ capabilities: safariCapabilities(target) }),
      }),
    { attempts: target === 'ios' ? 2 : 1 }
  );
  const sessionId = response.value?.sessionId ?? response.sessionId;
  if (!sessionId) throw new Error(`SafariDriver did not return a session ID: ${JSON.stringify(response)}`);
  return { capabilities: response.value?.capabilities ?? {}, sessionId };
}

export async function retrySafariSession(create, { attempts, retryDelayMs = 5_000, wait = delay }) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await create();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await wait(retryDelayMs);
    }
  }
  throw lastError;
}

export async function executeSafariScript(baseUrl, sessionId, script, args = [], { asynchronous = false } = {}) {
  const endpoint = asynchronous ? 'execute/async' : 'execute/sync';
  const response = await request(baseUrl, `/session/${sessionId}/${endpoint}`, {
    method: 'POST',
    body: JSON.stringify({ script, args }),
  });
  return response.value;
}

export async function deleteSafariSession(baseUrl, sessionId) {
  await request(baseUrl, `/session/${sessionId}`, { method: 'DELETE' });
}

export async function waitForDriver(
  baseUrl,
  { attempts = 240, retryDelayMs = 250, requestStatus = fetch, wait = delay, getDiagnostics = () => '' } = {}
) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await requestStatus(`${baseUrl}/status`);
      if (response.ok) return;
    } catch {}
    if (attempt + 1 < attempts) await wait(retryDelayMs);
  }
  const diagnostics = getDiagnostics().trim();
  throw new Error(`SafariDriver did not become ready.${diagnostics ? `\n${diagnostics}` : ''}`);
}

async function request(baseUrl, pathname, init) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    headers: { 'content-type': 'application/json' },
    ...init,
  });
  const payload = await response.json();
  if (!response.ok || payload.value?.error) {
    throw new Error(`SafariDriver ${init?.method ?? 'GET'} ${pathname} failed: ${JSON.stringify(payload)}`);
  }
  return payload;
}
