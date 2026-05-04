/**
 * SEC integration tests — spec: TEST_SPEC.md § Security rules
 *
 * All tests use the Firebase emulator's token override to simulate
 * custom claims (admin, moderator). No service account is used —
 * facility data is managed manually by Bryan in production.
 */
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, remove, set } from 'firebase/database';
import fs from 'fs';
import path from 'path';

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
    database: {
      host: 'localhost',
      port: 9000,
      rules: fs.readFileSync(path.join(projectRoot, 'database.rules.json'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.clearDatabase();
});

async function seedFacility(facilityId: string) {
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
    activeUsers: 0,
  });
}

async function seedMessage(facilityId: string, messageId: string, senderUid: string) {
  const sender = testEnv.authenticatedContext(senderUid);
  await set(
    ref(sender.database(), `chats/${facilityId}/messages/${messageId}`),
    {
      senderUid,
      senderUsername: `user_${senderUid}`,
      text: 'test message',
      timestamp: Date.now(),
    },
  );
}

describe('Security rules — integration', () => {
  it('SEC-I-01 unauthenticated user cannot read any Firestore document', async () => {
    await seedFacility('gym-01');

    const ctx = testEnv.unauthenticatedContext();
    const fs = ctx.firestore();

    await expect(
      getDoc(doc(fs, 'facilities', 'gym-01')),
    ).rejects.toThrow(/permission-denied/i);

    await expect(
      getDoc(doc(fs, 'users', 'some-uid')),
    ).rejects.toThrow(/permission-denied/i);
  });

  it('SEC-I-02 authenticated user cannot write a facilities document', async () => {
    await seedFacility('gym-01');

    const ctx = testEnv.authenticatedContext('user-alice');
    const fs = ctx.firestore();

    await expect(
      updateDoc(doc(fs, 'facilities', 'gym-01'), { name: 'Hacked Gym' }),
    ).rejects.toThrow(/permission-denied/i);
  });

  it('SEC-I-03 facility write succeeds only when request.auth has admin custom claim', async () => {
    await seedFacility('gym-01');

    // Without admin claim — must be denied
    const regularCtx = testEnv.authenticatedContext('user-alice');
    await expect(
      updateDoc(doc(regularCtx.firestore(), 'facilities', 'gym-01'), {
        openGymHours: 'Mon–Sat 6am–11pm',
      }),
    ).rejects.toThrow(/permission-denied/i);

    // With admin custom claim (emulator token override) — must succeed
    const adminCtx = testEnv.authenticatedContext('user-bryan', {
      admin: true,
    });
    await expect(
      updateDoc(doc(adminCtx.firestore(), 'facilities', 'gym-01'), {
        openGymHours: 'Mon–Sat 6am–11pm',
      }),
    ).resolves.toBeUndefined();
  });

  it('SEC-I-04 moderator can delete any RTDB message', async () => {
    await seedMessage('gym-01', 'msg-001', 'user-alice');

    const modCtx = testEnv.authenticatedContext('user-mod', {
      moderator: true,
    });

    await expect(
      remove(ref(modCtx.database(), 'chats/gym-01/messages/msg-001')),
    ).resolves.toBeUndefined();
  });

  it('SEC-I-05 regular user cannot delete another user\'s message', async () => {
    await seedMessage('gym-01', 'msg-001', 'user-alice');

    const ctx = testEnv.authenticatedContext('user-bob');

    await expect(
      remove(ref(ctx.database(), 'chats/gym-01/messages/msg-001')),
    ).rejects.toThrow(/permission-denied/i);
  });
});
