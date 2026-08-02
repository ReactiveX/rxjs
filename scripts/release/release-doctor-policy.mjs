export function requireWorkflowJobRunners(source, workflowName, expectedRunners) {
  const lines = source.split(/\r?\n/);
  const errors = [];

  for (const [jobName, expectedRunner] of Object.entries(expectedRunners)) {
    const jobStart = lines.findIndex((line) => line === `  ${jobName}:`);
    if (jobStart === -1) {
      errors.push(`${workflowName} is missing the ${jobName} job.`);
      continue;
    }

    let actualRunner;
    for (let index = jobStart + 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (/^(?:\S|  \S)/.test(line)) break;
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
