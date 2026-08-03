export function requireWorkflowJobRunners(source, workflowName, expectedRunners) {
  const lines = source.split(/\r?\n/);
  const errors = [];
  const jobsStart = lines.findIndex((line) => /^jobs:\s*(?:#.*)?$/.test(line));
  const jobsEnd =
    jobsStart === -1 ? -1 : lines.findIndex((line, index) => index > jobsStart && /^(?!#)[A-Za-z_][A-Za-z0-9_-]*:\s*/.test(line));
  const scopedEnd = jobsEnd === -1 ? lines.length : jobsEnd;

  for (const [jobName, expectedRunner] of Object.entries(expectedRunners)) {
    const jobPattern = new RegExp(`^ {2}${escapeRegExp(jobName)}:\\s*(?:#.*)?$`);
    const jobStarts = [];
    for (let index = jobsStart + 1; jobsStart !== -1 && index < scopedEnd; index += 1) {
      if (jobPattern.test(lines[index])) jobStarts.push(index);
    }
    if (jobStarts.length === 0) {
      errors.push(`${workflowName} is missing the ${jobName} job.`);
      continue;
    }
    if (jobStarts.length > 1) {
      errors.push(`${workflowName} defines the ${jobName} job more than once.`);
      continue;
    }

    const [jobStart] = jobStarts;
    let actualRunner;
    for (let index = jobStart + 1; index < scopedEnd; index += 1) {
      const line = lines[index];
      if (/^ {2}(?!#)\S/.test(line)) break;
      const runner = /^ {4}runs-on:\s*([^#]+?)(?:\s+#.*)?$/.exec(line)?.[1]?.trim();
      if (runner) {
        actualRunner = runner;
        break;
      }
    }

    if (actualRunner !== expectedRunner) {
      errors.push(`${workflowName} ${jobName} job must run on ${expectedRunner}; found ${actualRunner ?? 'no runner'}.`);
    }
  }

  return errors;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
