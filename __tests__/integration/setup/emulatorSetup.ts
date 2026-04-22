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

beforeAll(async () => {
  // Clean up any leftover app instances from a previous test file
  for (const app of getApps()) {
    await deleteApp(app);
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
    'test-app',
  );

  connectAuthEmulator(getAuth(app), 'http://localhost:9099', {
    disableWarnings: true,
  });
  connectFirestoreEmulator(getFirestore(app), 'localhost', 8080);
  connectDatabaseEmulator(getDatabase(app), 'localhost', 9000);
  connectStorageEmulator(getStorage(app), 'localhost', 9199);
});

afterAll(async () => {
  for (const app of getApps()) {
    await deleteApp(app);
  }
});
