#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function selectIosSimulator(devicesByRuntime) {
  const selectedRuntime = Object.entries(devicesByRuntime)
    .filter(([runtimeName]) => runtimeName.includes('.iOS-'))
    .sort(([left], [right]) => compareRuntimeVersions(right, left))
    .find(([, devices]) => devices.some((device) => device.isAvailable !== false && device.name?.startsWith('iPhone ')));

  const candidates = (selectedRuntime?.[1] ?? [])
    .filter((device) => device.isAvailable !== false && device.name?.startsWith('iPhone '))
    .map((device) => ({ ...device, runtime: selectedRuntime[0] }));

  candidates.sort((left, right) => {
    if (left.state === 'Booted' && right.state !== 'Booted') return -1;
    if (right.state === 'Booted' && left.state !== 'Booted') return 1;
    return devicePreference(right.name) - devicePreference(left.name);
  });

  if (candidates.length === 0) {
    throw new Error('No available iPhone simulator was reported by simctl.');
  }
  return candidates[0];
}

export function bootIosSimulator(run = execFileSync, recordEnvironment = recordGitHubEnvironment) {
  const listing = JSON.parse(run('xcrun', ['simctl', 'list', '--json', 'devices', 'available'], { encoding: 'utf8' }));
  const simulator = selectIosSimulator(listing.devices ?? {});

  if (simulator.state !== 'Booted') {
    run('xcrun', ['simctl', 'boot', simulator.udid], { stdio: 'inherit' });
  }
  run('open', ['-a', 'Simulator', '--args', '-CurrentDeviceUDID', simulator.udid], { stdio: 'inherit' });
  run('xcrun', ['simctl', 'bootstatus', simulator.udid, '-b'], { stdio: 'inherit' });
  run('xcrun', ['simctl', 'launch', simulator.udid, 'com.apple.mobilesafari'], { stdio: 'inherit' });
  recordEnvironment('RXJS_SAFARI_DEVICE_UDID', simulator.udid);
  process.stdout.write(`Booted ${simulator.name} (${simulator.runtime}, ${simulator.udid}).\n`);
  return simulator;
}

function recordGitHubEnvironment(name, value) {
  if (process.env.GITHUB_ENV) appendFileSync(process.env.GITHUB_ENV, `${name}=${value}\n`);
}

function compareRuntimeVersions(left, right) {
  const leftParts = runtimeVersion(left);
  const rightParts = runtimeVersion(right);
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index++) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

function runtimeVersion(runtime) {
  return runtime.split('.iOS-').at(-1).split('-').map(Number);
}

function devicePreference(name) {
  if (/ Pro Max$/.test(name)) return 3;
  if (/ Pro$/.test(name)) return 2;
  if (/^iPhone \d+$/.test(name)) return 1;
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  bootIosSimulator();
}
