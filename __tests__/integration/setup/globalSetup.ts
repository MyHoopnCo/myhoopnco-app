/**
 * globalSetup.ts — starts Firebase emulators before the integration suite.
 * Paired with globalTeardown.ts which shuts them down after all tests complete.
 */
import { execSync, spawn, ChildProcess } from 'child_process';
import path from 'path';

let emulatorProcess: ChildProcess;

module.exports = async () => {
  console.log('\n[test setup] Starting Firebase emulators...');

  emulatorProcess = spawn(
    'firebase',
    [
      'emulators:start',
      '--only', 'auth,firestore,database,storage',
      '--project', 'myhoop-test',
    ],
    {
      cwd: path.resolve(__dirname, '../../../'),
      stdio: 'pipe',
      detached: false,
    },
  );

  (global as any).__EMULATOR_PID__ = emulatorProcess.pid;

  await waitForEmulators();
  console.log('[test setup] Emulators ready.\n');
};

async function waitForEmulators(retries = 30, delayMs = 1000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      execSync('curl -s http://localhost:4000/ > /dev/null', { stdio: 'ignore' });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('Firebase emulators did not start within 30 seconds.');
}
