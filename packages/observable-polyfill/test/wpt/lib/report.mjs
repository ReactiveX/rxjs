function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeSubtests(subtests, attestationNamePrefix) {
  const normalized = {};
  for (const subtest of subtests) {
    if (!isRecord(subtest) || typeof subtest.name !== 'string' || typeof subtest.status !== 'string') {
      throw new Error('Malformed WPT subtest result');
    }
    if (subtest.name.startsWith(attestationNamePrefix)) {
      continue;
    }
    if (normalized[subtest.name] !== undefined) {
      throw new Error(`Duplicate WPT subtest name: ${subtest.name}`);
    }
    normalized[subtest.name] = subtest.status;
  }
  return Object.fromEntries(Object.entries(normalized).sort(([left], [right]) => left.localeCompare(right)));
}

export function normalizeReport(report, attestationNamePrefix) {
  if (!isRecord(report) || !Array.isArray(report.results) || !isRecord(report.run_info)) {
    throw new Error('Malformed WPT report');
  }

  const results = {};
  for (const result of report.results) {
    if (
      !isRecord(result) ||
      typeof result.test !== 'string' ||
      typeof result.status !== 'string' ||
      !Array.isArray(result.subtests)
    ) {
      throw new Error('Malformed WPT test result');
    }
    if (results[result.test] !== undefined) {
      throw new Error(`Duplicate WPT test result: ${result.test}`);
    }
    results[result.test] = {
      status: result.status,
      subtests: normalizeSubtests(result.subtests, attestationNamePrefix),
    };
  }

  return {
    browserVersion: report.run_info.browser_version,
    results: Object.fromEntries(Object.entries(results).sort(([left], [right]) => left.localeCompare(right))),
  };
}

function countStatuses(statuses) {
  const counts = {};
  for (const status of statuses) {
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return counts;
}

function formatStatusCounts(counts, preferredOrder) {
  const statuses = [
    ...preferredOrder.filter((status) => counts[status] !== undefined),
    ...Object.keys(counts)
      .filter((status) => !preferredOrder.includes(status))
      .sort(),
  ];
  return statuses.map((status) => `${status} ${counts[status]}`).join(', ');
}

function singleLine(value) {
  return value.replaceAll(/\s+/g, ' ').trim();
}

export function formatWptConsoleReport({
  audit,
  mode,
  expectedUrlCount,
  implementationId,
  reportPath,
  humanLogPath,
  rawLogPath,
  runRoot,
}) {
  const normalizedResults = audit.normalized?.results ?? {};
  const results = Object.entries(normalizedResults);
  const testStatusCounts = countStatuses(results.map(([, result]) => result.status));
  const subtestStatuses = results.flatMap(([, result]) => Object.values(result.subtests));
  const subtestStatusCounts = countStatuses(subtestStatuses);
  const passingAttestations = audit.attestations.filter(
    (attestation) => attestation.status === 'PASS'
  ).length;
  const lines = [
    `Observable WPT ${mode}: ${audit.ok ? 'PASS' : 'FAIL'}`,
    `Implementation: ${implementationId}`,
    `Test URLs: ${results.length}/${expectedUrlCount} reported` +
      (results.length > 0
        ? ` (${formatStatusCounts(testStatusCounts, ['OK', 'ERROR', 'TIMEOUT', 'CRASH'])})`
        : ''),
    `Upstream subtests: ${subtestStatuses.length}` +
      (subtestStatuses.length > 0
        ? ` (${formatStatusCounts(subtestStatusCounts, ['PASS', 'FAIL', 'TIMEOUT', 'NOTRUN'])})`
        : ''),
    `RxJS identity attestations: ${passingAttestations}/${expectedUrlCount} PASS`,
  ];

  const nonPassingResults = results.filter(
    ([, result]) =>
      result.status !== 'OK' ||
      Object.values(result.subtests).some((status) => status !== 'PASS')
  );
  if (nonPassingResults.length > 0) {
    lines.push('', `Non-passing WPT results (${nonPassingResults.length} URLs):`);
    for (const [testUrl, result] of nonPassingResults) {
      lines.push(`- ${testUrl} [${result.status}]`);
      for (const [name, status] of Object.entries(result.subtests)) {
        if (status !== 'PASS') {
          lines.push(`  - [${status}] ${singleLine(name)}`);
        }
      }
    }
  }

  const auditOnlyProblems =
    mode === 'conformance'
      ? audit.problems.filter((problem) => !problem.includes('strict mode requires'))
      : audit.problems;
  if (auditOnlyProblems.length > 0) {
    lines.push('', 'Harness/report audit failures:');
    lines.push(...auditOnlyProblems.map((problem) => `- ${singleLine(problem)}`));
  }

  lines.push(
    '',
    'Artifacts:',
    `- Structured report: ${reportPath}`,
    `- Human-readable runner log: ${humanLogPath}`,
    `- Raw runner log: ${rawLogPath}`,
    `- Complete artifact directory: ${runRoot}`,
    ''
  );
  return lines.join('\n');
}

function compareResultMaps(actual, expected, problems) {
  const actualUrls = Object.keys(actual);
  const expectedUrls = Object.keys(expected);
  if (JSON.stringify(actualUrls) !== JSON.stringify(expectedUrls)) {
    problems.push('WPT baseline URL set differs from the report');
    return;
  }

  for (const testUrl of expectedUrls) {
    const actualResult = actual[testUrl];
    const expectedResult = expected[testUrl];
    if (actualResult.status !== expectedResult.status) {
      problems.push(`${testUrl}: expected test status ${expectedResult.status}, got ${actualResult.status}`);
    }

    const actualNames = Object.keys(actualResult.subtests);
    const expectedNames = Object.keys(expectedResult.subtests);
    if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
      problems.push(`${testUrl}: upstream subtest inventory differs from the baseline`);
      continue;
    }

    for (const name of expectedNames) {
      if (actualResult.subtests[name] !== expectedResult.subtests[name]) {
        problems.push(
          `${testUrl} :: ${name}: expected ${expectedResult.subtests[name]}, got ${actualResult.subtests[name]}`
        );
      }
    }
  }
}

export function auditReport({
  report,
  inventory,
  bundleSha256,
  attestationNamePrefix,
  expectedResults,
  strict,
  expectedWptCommit,
  expectedBrowserVersion,
  allowBrowserDrift = false,
  requireBaseline = true,
}) {
  const problems = [];
  let normalized;
  try {
    normalized = normalizeReport(report, attestationNamePrefix);
  } catch (error) {
    return { ok: false, problems: [error.message], attestations: [], normalized: null };
  }

  if (
    !allowBrowserDrift &&
    normalized.browserVersion !== expectedBrowserVersion
  ) {
    problems.push(`Expected Chrome ${expectedBrowserVersion}, got ${normalized.browserVersion ?? 'unknown'}`);
  }

  const actualUrls = Object.keys(normalized.results);
  if (JSON.stringify(actualUrls) !== JSON.stringify([...inventory].sort())) {
    const actualSet = new Set(actualUrls);
    const expectedSet = new Set(inventory);
    for (const testUrl of inventory) {
      if (!actualSet.has(testUrl)) {
        problems.push(`Missing WPT result: ${testUrl}`);
      }
    }
    for (const testUrl of actualUrls) {
      if (!expectedSet.has(testUrl)) {
        problems.push(`Unexpected WPT result: ${testUrl}`);
      }
    }
  }

  const expectedAttestationName = `${attestationNamePrefix}${bundleSha256} is active`;
  const attestations = [];
  for (const result of report.results) {
    const attestationSubtests = result.subtests.filter((subtest) =>
      subtest.name?.startsWith(attestationNamePrefix)
    );
    if (attestationSubtests.length !== 1) {
      problems.push(`${result.test}: expected exactly one RxJS identity attestation, found ${attestationSubtests.length}`);
      continue;
    }

    const attestation = attestationSubtests[0];
    attestations.push({
      test: result.test,
      name: attestation.name,
      status: attestation.status,
      bundleSha256,
    });
    if (attestation.name !== expectedAttestationName) {
      problems.push(`${result.test}: attested a different implementation (${attestation.name})`);
    }
    if (attestation.status !== 'PASS') {
      problems.push(`${result.test}: RxJS identity attestation was ${attestation.status}`);
    }
    if (attestation.expected !== undefined && attestation.expected !== 'PASS') {
      problems.push(`${result.test}: RxJS identity attestation was allowlisted`);
    }
    if (Array.isArray(attestation.known_intermittent) && attestation.known_intermittent.length > 0) {
      problems.push(`${result.test}: RxJS identity attestation was marked intermittent`);
    }
  }

  if (strict) {
    for (const [testUrl, result] of Object.entries(normalized.results)) {
      if (result.status !== 'OK') {
        problems.push(`${testUrl}: strict mode requires OK, got ${result.status}`);
      }
      for (const [name, status] of Object.entries(result.subtests)) {
        if (status !== 'PASS') {
          problems.push(`${testUrl} :: ${name}: strict mode requires PASS, got ${status}`);
        }
      }
    }
  } else if (expectedResults) {
    if (
      typeof expectedResults.wptCommit !== 'string' ||
      typeof expectedResults.browserVersion !== 'string' ||
      !isRecord(expectedResults.results)
    ) {
      problems.push('Malformed checked-in WPT result baseline');
    } else {
      if (expectedWptCommit !== undefined && expectedResults.wptCommit !== expectedWptCommit) {
        problems.push(
          `Expected baseline for WPT ${expectedWptCommit}, got ${expectedResults.wptCommit}`
        );
      }
      if (expectedResults.browserVersion !== expectedBrowserVersion) {
        problems.push(
          `Expected baseline for Chrome ${expectedBrowserVersion}, got ${expectedResults.browserVersion}`
        );
      }
      compareResultMaps(normalized.results, expectedResults.results, problems);
    }
  } else if (requireBaseline) {
    problems.push('No checked-in WPT result baseline was provided');
  }

  return {
    ok: problems.length === 0,
    problems,
    attestations,
    normalized,
  };
}

export function compareStableReports(normalizedReports) {
  if (normalizedReports.length < 3) {
    throw new Error('At least three complete WPT reports are required to update expectations');
  }
  const first = JSON.stringify(normalizedReports[0].results);
  for (let index = 1; index < normalizedReports.length; index++) {
    if (JSON.stringify(normalizedReports[index].results) !== first) {
      throw new Error(`WPT report ${index + 1} differs from report 1; refusing to create an intermittent baseline`);
    }
  }
}

export function createExpectedResults({ config, normalizedReport }) {
  return {
    schemaVersion: 1,
    wptCommit: config.wpt.commit,
    browserVersion: config.browser.version,
    results: normalizedReport.results,
  };
}
