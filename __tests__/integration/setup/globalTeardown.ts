/**
 * globalTeardown.ts — kills the Firebase emulator process tree after all
 * integration tests have completed.
 *
 * Jest may run globalSetup in a different process than globalTeardown, so the
 * emulator PID is written to a temp file in globalSetup.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const EMULATOR_PID_FILE = path.join(os.tmpdir(), 'myhoopnco-app-expo-firebase-emulator.pid');

module.exports = async () => {
  let pid: number | undefined;
  try {
    if (fs.existsSync(EMULATOR_PID_FILE)) {
      const raw = fs.readFileSync(EMULATOR_PID_FILE, 'utf8').trim();
      pid = Number(raw);
      fs.unlinkSync(EMULATOR_PID_FILE);
    }
  } catch {
    /* ignore */
  }
  if (!pid || !Number.isFinite(pid)) {
    pid = (global as any).__EMULATOR_PID__ as number | undefined;
  }
  if (!pid || !Number.isFinite(pid)) return;

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
