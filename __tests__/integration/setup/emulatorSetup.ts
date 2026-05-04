/**
 * emulatorSetup.ts — runs before each integration test file.
 * Connects all Firebase SDKs to the local emulator hosts.
 */
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const TEST_PROJECT_ID = 'myhoop-test';
const TEST_APP_NAME = 'test-app';

beforeAll(async () => {
  // Only remove our named app. Do not deleteApp(getApps()) — that tears down
  // internal `_Firebase_RulesUnitTesting_*` apps and breaks testEnv.cleanup().
  const existing = getApps().find((a) => a.name === TEST_APP_NAME);
  if (existing) {
    await deleteApp(existing);
  }

  const app = initializeApp(
    {
      apiKey: 'test-api-key',
      authDomain: `${TEST_PROJECT_ID}.firebaseapp.com`,
      projectId: TEST_PROJECT_ID,
      storageBucket: `${TEST_PROJECT_ID}.appspot.com`,
      messagingSenderId: '000000000000',
      appId: '1:000000000000:web:testappid',
      databaseURL: `http://localhost:9000?ns=${TEST_PROJECT_ID}`,
    },
    TEST_APP_NAME,
  );

  connectAuthEmulator(getAuth(app), 'http://localhost:9099', {
    disableWarnings: true,
  });
  connectFirestoreEmulator(getFirestore(app), 'localhost', 8080);
  connectDatabaseEmulator(getDatabase(app), 'localhost', 9000);
  connectStorageEmulator(getStorage(app), 'localhost', 9199);
});

afterAll(async () => {
  const testApp = getApps().find((a) => a.name === TEST_APP_NAME);
  if (testApp) {
    await deleteApp(testApp);
  }
});
