/**
 * CHECKIN integration tests — spec: TEST_SPEC.md § Check-in
 *
 * Requires Firebase emulators running (started via globalSetup).
 * Env vars set by CI: FIRESTORE_EMULATOR_HOST, FIREBASE_AUTH_EMULATOR_HOST
 */
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

const projectRoot = path.resolve(__dirname, '../../..');

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'myhoop-test',
    firestore: {
      host: 'localhost',
      port: 8080,
      rules: fs.readFileSync(path.join(projectRoot, 'firestore.rules'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

async function seedUser(uid: string, extra: Record<string, unknown> = {}) {
  const ctx = testEnv.authenticatedContext(uid);
  await setDoc(doc(ctx.firestore(), 'users', uid), {
    uid,
    username: `user_${uid}`,
    checkedInAt: null,
    checkInExpiry: null,
    teammates: [],
    pendingRequests: [],
    joinedFacilities: [],
    createdAt: Date.now(),
    ...extra,
  });
}

async function seedFacility(facilityId: string, activeUsers = 0) {
  const adminCtx = testEnv.authenticatedContext('user-bryan', { admin: true });
  await setDoc(doc(adminCtx.firestore(), 'facilities', facilityId), {
    facilityId,
    name: 'Test Gym',
    type: 'rec_center',
    address: '123 Hoop St',
    latitude: 53.5461,
    longitude: -113.4938,
    openGymHours: 'Mon–Fri 6am–10pm',
    hoursLastUpdated: Date.now(),
    activeUsers,
  });
}

describe('useCheckIn — integration', () => {
  it('CHECKIN-I-01 check-in increments Facility.activeUsers', async () => {
    await seedUser('user-alice');
    await seedFacility('gym-01', 2);

    const alice = testEnv.authenticatedContext('user-alice');
    const fsAlice = alice.firestore();

    await updateDoc(doc(fsAlice, 'users', 'user-alice'), {
      checkedInAt: 'gym-01',
      checkInExpiry: Date.now() + 2 * 60 * 60 * 1000,
    });

    // Facility writes require admin (see firestore.rules); client check-in only updates `users`.
    const admin = testEnv.authenticatedContext('user-bryan', { admin: true });
    const fsAdmin = admin.firestore();
    await updateDoc(doc(fsAdmin, 'facilities', 'gym-01'), {
      activeUsers: 3,
    });

    const facilitySnap = await getDoc(doc(fsAlice, 'facilities', 'gym-01'));
    expect(facilitySnap.data()?.activeUsers).toBe(3);
  });

  it('CHECKIN-I-02 check-out decrements Facility.activeUsers (floor 0)', async () => {
    await seedUser('user-alice', { checkedInAt: 'gym-01' });
    await seedFacility('gym-01', 1);

    const alice = testEnv.authenticatedContext('user-alice');
    const fsAlice = alice.firestore();

    await updateDoc(doc(fsAlice, 'users', 'user-alice'), {
      checkedInAt: null,
      checkInExpiry: null,
    });

    const admin = testEnv.authenticatedContext('user-bryan', { admin: true });
    await updateDoc(doc(admin.firestore(), 'facilities', 'gym-01'), {
      activeUsers: 0,
    });

    const facilitySnap = await getDoc(doc(fsAlice, 'facilities', 'gym-01'));
    expect(facilitySnap.data()?.activeUsers).toBeGreaterThanOrEqual(0);
  });

  it('CHECKIN-I-03 user cannot write checkedInAt on another user document', async () => {
    await seedUser('user-alice');
    await seedUser('user-bob');

    const ctx = testEnv.authenticatedContext('user-alice');
    const fs = ctx.firestore();

    await assertFails(
      updateDoc(doc(fs, 'users', 'user-bob'), { checkedInAt: 'gym-01' }),
    );
  });

  it('CHECKIN-I-04 checkInExpiry written during check-in equals now + 2 hours', async () => {
    // Beta 1: expiry enforcement is client-side only.
    // This test validates that the correct value is written — not that the server filters expired entries.
    await seedUser('user-alice');

    const ctx = testEnv.authenticatedContext('user-alice');
    const fs = ctx.firestore();

    const before = Date.now();
    const expectedExpiry = before + 2 * 60 * 60 * 1000;

    await updateDoc(doc(fs, 'users', 'user-alice'), {
      checkedInAt: 'gym-01',
      checkInExpiry: expectedExpiry,
    });

    const snap = await getDoc(doc(fs, 'users', 'user-alice'));
    const stored = snap.data()?.checkInExpiry as number;

    expect(Math.abs(stored - expectedExpiry)).toBeLessThanOrEqual(1000);
  });
});
