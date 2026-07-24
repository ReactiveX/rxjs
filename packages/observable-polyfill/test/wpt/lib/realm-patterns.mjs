const riskyPatterns = [
  ['contentDocument', /\bcontentDocument\b/g],
  ['contentWindow', /\bcontentWindow\b/g],
  ['createHTMLDocument', /\bcreateHTMLDocument\b/g],
  ['iframe', /\biframe\b/g],
  ['SharedWorker', /\bSharedWorker\s*\(/g],
  ['srcdoc', /\bsrcdoc\b/g],
  ['window.open', /\bwindow\.open\s*\(/g],
  ['Worker', /\bWorker\s*\(/g],
];

function countMatches(source, pattern) {
  return source.match(pattern)?.length ?? 0;
}

export function verifyRealmPatterns(files, reviewedIframeFiles) {
  const problems = [];
  const reviewedPaths = new Set(Object.keys(reviewedIframeFiles));

  for (const [filePath, source] of files) {
    const findings = [];
    for (const [name, pattern] of riskyPatterns) {
      const count = countMatches(source, pattern);
      if (count > 0) {
        findings.push(`${name}=${count}`);
      }
    }

    if (findings.length === 0) {
      continue;
    }

    const review = reviewedIframeFiles[filePath];
    if (!review) {
      problems.push(`${filePath}: unreviewed realm pattern (${findings.join(', ')})`);
      continue;
    }

    const createElementCount = countMatches(source, /document\.createElement\(\s*['"]iframe['"]\s*\)/g);
    const contentWindowCount = countMatches(source, /\biframe\.contentWindow\b/g);
    const helperCallCount = countMatches(source, /\bawait\s+loadIframeAndReturnContentWindow\(\s*\)/g);
    const childRealmCount = helperCallCount || contentWindowCount;
    if (
      createElementCount !== review.createElementCount ||
      contentWindowCount !== review.contentWindowCount ||
      childRealmCount !== review.childRealmCount
    ) {
      problems.push(
        `${filePath}: expected createElement=${review.createElementCount}, contentWindow=${review.contentWindowCount}, ` +
          `and child realms=${review.childRealmCount}; found createElement=${createElementCount}, ` +
          `contentWindow=${contentWindowCount}, and child realms=${childRealmCount}`
      );
    }

    const allowedFindingNames = new Set(['contentWindow', 'iframe']);
    const forbiddenFindings = findings.filter((finding) => !allowedFindingNames.has(finding.split('=')[0]));
    if (forbiddenFindings.length > 0) {
      problems.push(`${filePath}: reviewed iframe helper gained unsupported patterns (${forbiddenFindings.join(', ')})`);
    }
  }

  for (const reviewedPath of reviewedPaths) {
    if (!files.has(reviewedPath)) {
      problems.push(`${reviewedPath}: reviewed iframe file is missing`);
    }
  }

  return problems;
}
