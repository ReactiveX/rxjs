import { spawn } from 'node:child_process';

export function runProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    let timedOut = false;
    let forceKillTimer;
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env ?? process.env,
      stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    });
    const timeoutTimer =
      options.timeoutMs === undefined
        ? undefined
        : setTimeout(() => {
            timedOut = true;
            child.kill('SIGTERM');
            forceKillTimer = setTimeout(() => child.kill('SIGKILL'), 5000);
          }, options.timeoutMs);

    let stdout = '';
    let stderr = '';
    child.stdout?.setEncoding('utf8');
    child.stderr?.setEncoding('utf8');
    child.stdout?.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr?.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', (error) => {
      clearTimeout(timeoutTimer);
      clearTimeout(forceKillTimer);
      reject(error);
    });
    child.on('close', (code, signal) => {
      clearTimeout(timeoutTimer);
      clearTimeout(forceKillTimer);
      if (timedOut) {
        reject(new Error(`${command} ${args.join(' ')} timed out after ${options.timeoutMs} ms`));
        return;
      }
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      const detail = stderr.trim() || stdout.trim();
      reject(
        new Error(
          `${command} ${args.join(' ')} exited with ${signal ? `signal ${signal}` : `code ${code}`}` +
            (detail ? `\n${detail}` : '')
        )
      );
    });
  });
}
