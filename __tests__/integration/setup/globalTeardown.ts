/**
 * globalTeardown.ts — kills the Firebase emulator process tree after all
 * integration tests have completed.
 */
import { execSync } from 'child_process';

module.exports = async () => {
  const pid = (global as any).__EMULATOR_PID__ as number | undefined;
  if (!pid) return;

  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
    } else {
      try {
        process.kill(-pid, 'SIGTERM');
      } catch {
        process.kill(pid, 'SIGTERM');
      }
    }
    console.log('\n[test teardown] Firebase emulators stopped.');
  } catch {
    // Process tree may have already exited — safe to ignore
  }
};
