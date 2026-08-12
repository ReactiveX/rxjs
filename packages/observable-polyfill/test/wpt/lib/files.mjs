import fs from 'node:fs/promises';
import path from 'node:path';

export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function listFiles(root) {
  const files = [];

  async function visit(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath);
      } else if (entry.isFile()) {
        files.push(path.relative(root, absolutePath).split(path.sep).join('/'));
      } else {
        throw new Error(`Unsupported non-file entry in WPT tree: ${absolutePath}`);
      }
    }
  }

  if (await pathExists(root)) {
    await visit(root);
  }
  return files;
}

export async function copyTree(source, destination) {
  await fs.mkdir(destination, { recursive: true });
  for (const filePath of await listFiles(source)) {
    const targetPath = path.join(destination, filePath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(path.join(source, filePath), targetPath);
  }
}

export async function replaceDirectory(source, destination) {
  const backup = `${destination}.backup`;
  await fs.rm(backup, { recursive: true, force: true });

  const hadDestination = await pathExists(destination);
  if (hadDestination) {
    await fs.rename(destination, backup);
  }

  try {
    await fs.rename(source, destination);
    await fs.rm(backup, { recursive: true, force: true });
  } catch (error) {
    if (hadDestination && !(await pathExists(destination))) {
      await fs.rename(backup, destination);
    }
    throw error;
  }
}
