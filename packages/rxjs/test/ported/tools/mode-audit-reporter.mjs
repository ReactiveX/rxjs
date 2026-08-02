import { writeFile } from 'node:fs/promises';

export default class ModeAuditReporter {
  #filesByPath = new Map();
  #tasksById = new Map();

  onCollected(files = []) {
    const snapshot = createCollectedSnapshot(files);
    for (const file of snapshot.files) {
      const existing = this.#filesByPath.get(file.filepath);
      this.#filesByPath.set(file.filepath, preferMoreCompleteTaskTree(existing, file));
    }
    for (const [id, task] of snapshot.tasksById) {
      this.#tasksById.set(id, task);
    }
  }

  onTaskUpdate(packs) {
    applyTaskUpdates(this.#tasksById, packs);
  }

  async onFinished(files = [], errors = []) {
    const outputPath = process.env.RXJS_NEXT_AUDIT_REPORT;
    if (!outputPath) {
      throw new Error('RXJS_NEXT_AUDIT_REPORT must name the mode-audit report file.');
    }
    if (this.#filesByPath.size === 0) {
      this.onCollected(files);
    } else {
      applyFinalResults(this.#tasksById, files);
    }
    await writeFile(outputPath, `${JSON.stringify(createAuditReport([...this.#filesByPath.values()], errors))}\n`);
  }
}

export function createCollectedSnapshot(files) {
  const tasksById = new Map();
  return { files: files.map((file) => cloneTask(file, tasksById)), tasksById };
}

export function applyTaskUpdates(tasksById, packs) {
  for (const [id, result] of packs) {
    const task = tasksById.get(id);
    if (task) task.result = result;
  }
}

export function preferMoreCompleteTaskTree(existing, candidate) {
  return existing && collectTests(existing).length > collectTests(candidate).length ? existing : candidate;
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

function cloneTask(task, tasksById) {
  const clone = {
    id: task.id,
    type: task.type,
    mode: task.mode,
    filepath: task.filepath,
    result: task.result,
    tasks: (task.tasks ?? []).map((child) => cloneTask(child, tasksById)),
  };
  if (clone.id) tasksById.set(clone.id, clone);
  return clone;
}

function applyFinalResults(tasksById, tasks) {
  for (const task of tasks) {
    const collected = tasksById.get(task.id);
    if (collected && task.result) collected.result = task.result;
    applyFinalResults(tasksById, task.tasks ?? []);
  }
}

function taskStatus(task) {
  if (task.mode === 'todo') return 'todo';
  if (task.mode === 'skip' || task.result?.state === 'skip') return 'pending';
  if (task.result?.state === 'pass') return 'passed';
  if (task.result?.state === 'fail') return 'failed';
  return 'incomplete';
}
