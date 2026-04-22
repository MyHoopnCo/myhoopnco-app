/**
 * globalTeardown.ts — kills the Firebase emulator process after all
 * integration tests have completed.
 */
module.exports = async () => {
  const pid = (global as any).__EMULATOR_PID__;
  if (pid) {
    try {
      process.kill(pid, 'SIGTERM');
      console.log('\n[test teardown] Firebase emulators stopped.');
    } catch {
      // Process may have already exited — safe to ignore
    }
  }
};
