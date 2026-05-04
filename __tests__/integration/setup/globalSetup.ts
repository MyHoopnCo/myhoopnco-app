/**
 * globalSetup.ts — starts Firebase emulators before the integration suite.
 * Paired with globalTeardown.ts which shuts them down after all tests complete.
 */
import { execSync, spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

let emulatorProcess: ChildProcess;

const EMULATOR_PID_FILE = path.join(os.tmpdir(), 'myhoopnco-app-expo-firebase-emulator.pid');

module.exports = async () => {
  console.log('\n[test setup] Starting Firebase emulators...');

  // Unix: detached session so globalTeardown can signal the whole emulator tree via kill(-pid).
  const useDetached = process.platform !== 'win32';
  emulatorProcess = spawn(
    'firebase',
    [
      'emulators:start',
      '--only', 'auth,firestore,database,storage',
      '--project', 'myhoop-test',
    ],
    {
      cwd: path.resolve(__dirname, '../../../'),
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: useDetached,
    },
  );

  emulatorProcess.stdout?.on('data', (data) => {
    console.log(`[firebase] ${data.toString().trim()}`);
  });

  emulatorProcess.stderr?.on('data', (data) => {
    console.error(`[firebase] ${data.toString().trim()}`);
  });

  const pid = emulatorProcess.pid;
  (global as any).__EMULATOR_PID__ = pid;
  if (pid) {
    fs.writeFileSync(EMULATOR_PID_FILE, String(pid), 'utf8');
  }

  try {
    await waitForEmulators();
  } catch (err) {
    try {
      fs.unlinkSync(EMULATOR_PID_FILE);
    } catch {
      /* ignore */
    }
    try {
      if (pid) {
        if (process.platform === 'win32') {
          execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
        } else {
          try {
            process.kill(-pid, 'SIGTERM');
          } catch {
            process.kill(pid, 'SIGTERM');
          }
        }
      }
    } catch {
      /* ignore */
    }
    throw err;
  }
  console.log('[test setup] Emulators ready.\n');
};

async function waitForEmulators(retries = 150, delayMs = 1000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      execSync('curl -s http://localhost:4000/ > /dev/null', { stdio: 'ignore' });
      console.log(`[test setup] Emulators available after ~${i}s`);
      return;
    } catch {
      if (i % 15 === 0) {
        console.log(`[test setup] Waiting for emulators... (${i}/${retries}s)`);
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('Firebase emulators did not start within 150 seconds.');
}