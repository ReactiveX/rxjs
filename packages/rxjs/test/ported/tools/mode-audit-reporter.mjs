import { writeFile } from 'node:fs/promises';

export default class ModeAuditReporter {
  async onFinished(files = [], errors = []) {
    const outputPath = process.env.RXJS_NEXT_AUDIT_REPORT;
    if (!outputPath) {
      throw new Error('RXJS_NEXT_AUDIT_REPORT must name the mode-audit report file.');
    }
    await writeFile(outputPath, `${JSON.stringify(createAuditReport(files, errors))}\n`);
  }
}

export function createAuditReport(files, errors = []) {
  const testResults = files.map((file) => {
    const tests = collectTests(file);
    return {
      name: file.filepath,
      status: file.result?.state === 'fail' ? 'failed' : 'passed',
      assertionResults: tests.map((test) => ({ status: taskStatus(test) })),
    };
  });
  const assertions = testResults.flatMap((file) => file.assertionResults);
  return {
    numTotalTests: assertions.length,
    numPassedTests: assertions.filter((assertion) => assertion.status === 'passed').length,
    numFailedTests: assertions.filter((assertion) => assertion.status === 'failed').length,
    numPendingTests: assertions.filter((assertion) => assertion.status === 'pending').length,
    numTodoTests: assertions.filter((assertion) => assertion.status === 'todo').length,
    unhandledErrors: errors.length,
    testResults,
  };
}

function collectTests(task) {
  if (task.type === 'test' || task.type === 'custom') {
    return [task];
  }
  return (task.tasks ?? []).flatMap(collectTests);
}

function taskStatus(task) {
  if (task.mode === 'todo') return 'todo';
  if (task.mode === 'skip' || task.result?.state === 'skip') return 'pending';
  if (task.result?.state === 'pass') return 'passed';
  if (task.result?.state === 'fail') return 'failed';
  return 'incomplete';
}
