# MyHoop Beta 1 — Test specification

Every test listed below must pass before CI marks a build green.
Tests are organized by feature. Each entry shows: the test ID, suite type
(unit / integration), and the exact passing condition.

---

## AUTH — Sign up, log in, password reset

### Unit tests

| ID | Description | Passes when |
|----|-------------|-------------|
| AUTH-U-01 | `AuthService.signUp` validates empty email | Throws `auth/invalid-email` |
| AUTH-U-02 | `AuthService.signUp` validates weak password | Throws `auth/weak-password` |
| AUTH-U-03 | `AuthService.signInGoogle` calls Firebase `signInWithPopup` | Mock called once |
| AUTH-U-04 | `AuthService.signInApple` calls Firebase `signInWithPopup` | Mock called once |
| AUTH-U-05 | `AuthService.resetPassword` calls `sendPasswordResetEmail` | Mock called with correct email |
| AUTH-U-06 | `AuthService.logout` calls `signOut` | Mock called once; `currentUser` becomes null |

### Integration tests

| ID | Description | Passes when |
|----|-------------|-------------|
| AUTH-I-01 | New user sign-up creates Firestore `users/{uid}` document | Document exists with correct `uid`, `username`, `createdAt` |
| AUTH-I-02 | Duplicate username is rejected | Write rejected by security rule; error thrown |
| AUTH-I-03 | Sign in with email/password returns authenticated user | `currentUser.uid` matches created user |
| AUTH-I-04 | Unauthenticated read of another user's profile is blocked | Security rule returns `permission-denied` |

---

## USER PROFILE — Edit, view, visibility rules

### Unit tests

| ID | Description | Passes when |
|----|-------------|-------------|
| PROFILE-U-01 | `ProfileScreen` renders own profile fields | `username`, `bio`, `avatarUrl` visible in output |
| PROFILE-U-02 | Full profile visible when viewer is a teammate | All fields rendered; no hidden sections |
| PROFILE-U-03 | Limited profile shown to non-teammate from chat | Only `username` and `avatarUrl` rendered |
| PROFILE-U-04 | Avatar upload calls `FirebaseStorage.upload` | Mock called with correct file path |

### Integration tests

| ID | Description | Passes when |
|----|-------------|-------------|
| PROFILE-I-01 | User can update own `bio` and `username` | Firestore document reflects new values |
| PROFILE-I-02 | User cannot write to another user's document | Security rule returns `permission-denied` |
| PROFILE-I-03 | `avatarUrl` resolves to a valid Storage URL | URL returns HTTP 200 from emulator |

---

## FACILITY MAP — View, search, directions

### Unit tests

| ID | Description | Passes when |
|----|-------------|-------------|
| MAP-U-01 | `MapScreen` renders a `FacilityCard` for each facility | Card count equals mock facilities length |
| MAP-U-02 | `MapScreen` filters by search query (name match) | Only matching facilities rendered |
| MAP-U-03 | `MapScreen` filters by search query (no match) | Empty state rendered |
| MAP-U-04 | `FacilityCard` displays `name`, `type`, `activeUsers` | All three fields present in output |
| MAP-U-05 | Get directions calls native maps deep link | Deep link constructed with correct lat/lng |

### Integration tests

| ID | Description | Passes when |
|----|-------------|-------------|
| MAP-I-01 | Facilities collection readable by any authenticated user | All seeded facilities returned |
| MAP-I-02 | Unauthenticated read of facilities is blocked | Security rule returns `permission-denied` |

---

## CHECK-IN — Check in, check out, expiry

### Unit tests

| ID | Description | Passes when |
|----|-------------|-------------|
| CHECKIN-U-01 | `FacilityCard.checkIn` writes `checkedInAt` and `checkInExpiry` | Firestore mock called with correct payload |
| CHECKIN-U-02 | `checkInExpiry` is set to now + 2 hours | Timestamp within 1 second of expected value |
| CHECKIN-U-03 | `FacilityCard.checkOut` clears `checkedInAt` to null | Mock called; field set to null |
| CHECKIN-U-04 | Checking into facility B clears previous check-in at A | Previous `checkedInAt` overwritten |

### Integration tests

| ID | Description | Passes when |
|----|-------------|-------------|
| CHECKIN-I-01 | Check-in increments `Facility.activeUsers` | Counter increases by 1 |
| CHECKIN-I-02 | Check-out decrements `Facility.activeUsers` (floor 0) | Counter decreases by 1; never goes below 0 |
| CHECKIN-I-03 | User can only write `checkedInAt` on own document | Write to other user's doc returns `permission-denied` |
| CHECKIN-I-04 | `checkInExpiry` written during check-in equals now + 2 hours | Stored timestamp is within 1 second of `Date.now() + 7200000`. Expiry enforcement is client-side only in Beta 1 — this test validates the correct value is written, not server-side filtering. |

---

## FACILITY CHAT — Join, send, receive messages

### Unit tests

| ID | Description | Passes when |
|----|-------------|-------------|
| CHAT-U-01 | `ChatsScreen` lists only facilities in `joinedFacilities` | Rendered list matches mock array |
| CHAT-U-02 | `FacilityCard.joinChat` adds `facilityId` to `joinedFacilities` | Firestore mock called with array-union |
| CHAT-U-03 | `ChatsScreen.sendMessage` writes correct shape to RTDB | Mock called with `senderUid`, `senderUsername`, `text`, `timestamp` |
| CHAT-U-04 | Message list renders in ascending timestamp order | Rendered messages in correct order |
| CHAT-U-05 | Non-member cannot see join button after already joined | Button absent from output |

### Integration tests

| ID | Description | Passes when |
|----|-------------|-------------|
| CHAT-I-01 | Member can write a message to joined facility's chat | Message appears in RTDB path |
| CHAT-I-02 | Non-member write to chat is blocked | RTDB security rule returns `permission-denied` |
| CHAT-I-03 | Messages subscribe in real time | Second client receives message within timeout |
| CHAT-I-04 | Message contains only `text`, no media fields | Schema validation passes |

---

## MESSAGE CLEANUP — Auto-delete after 48 hours

### Unit tests

| ID | Description | Passes when |
|----|-------------|-------------|
| CLEANUP-U-01 | `MessageCleanupFunction` identifies messages older than 48h | Correct messages selected from mock dataset |
| CLEANUP-U-02 | Messages newer than 48h are NOT deleted | Mock delete not called for recent messages |
| CLEANUP-U-03 | Cleanup function deletes all stale messages in batch | Delete called once per stale message |

### Integration tests

| ID | Description | Passes when |
|----|-------------|-------------|
| CLEANUP-I-01 | Seeded messages with `timestamp < now - 48h` removed after function run | RTDB path empty after invocation |
| CLEANUP-I-02 | Recent messages survive cleanup | Message count unchanged for recent entries |

---

## TEAMMATE SYSTEM — Request, accept, decline

### Unit tests

| ID | Description | Passes when |
|----|-------------|-------------|
| TEAMMATE-U-01 | `sendTeammateRequest` adds target UID to own `pendingRequests` | Firestore mock called with array-union |
| TEAMMATE-U-02 | `acceptRequest` adds both UIDs to each other's `teammates` | Two Firestore writes called |
| TEAMMATE-U-03 | `acceptRequest` removes UID from `pendingRequests` | Array-remove called on requester doc |
| TEAMMATE-U-04 | `declineRequest` removes UID from `pendingRequests` only | Only one Firestore write; no `teammates` update |
| TEAMMATE-U-05 | Cannot send request to existing teammate | Function returns early; no write |

### Integration tests

| ID | Description | Passes when |
|----|-------------|-------------|
| TEAMMATE-I-01 | Accept flow results in symmetric `teammates` arrays | Both user documents contain each other's UID |
| TEAMMATE-I-02 | User cannot write directly to another's `teammates` field | Security rule returns `permission-denied` |
| TEAMMATE-I-03 | Declined request leaves both `teammates` arrays unchanged | Assertion on both documents after decline |

---

## SECURITY RULES — Cross-cutting

### Integration tests

| ID | Description | Passes when |
|----|-------------|-------------|
| SEC-I-01 | Unauthenticated user cannot read any Firestore document | All reads return `permission-denied` |
| SEC-I-02 | Authenticated user cannot write a `facilities` document | Write returns `permission-denied` |
| SEC-I-03 | Firestore rule permits facility writes only when `request.auth` has admin custom claim | Write with admin claim succeeds; write without it returns `permission-denied`. Uses emulator token override — not a service account. Facility data is curated manually by Bryan in production. |
| SEC-I-04 | Moderator can delete any RTDB message | Delete succeeds with moderator custom claim set via emulator token override |
| SEC-I-05 | Regular user cannot delete another user's message | Delete returns `permission-denied` |

---

## Test file conventions

```
__tests__/
  unit/
    auth/          AUTH-U-*
    profile/       PROFILE-U-*
    map/           MAP-U-*
    checkin/       CHECKIN-U-*
    chat/          CHAT-U-*
    cleanup/       CLEANUP-U-*
    teammate/      TEAMMATE-U-*
  integration/
    setup/
      globalSetup.ts      — start Firebase emulators
      globalTeardown.ts   — stop emulators
      emulatorSetup.ts    — connect SDKs to emulator hosts
    auth/          AUTH-I-*
    profile/       PROFILE-I-*
    map/           MAP-I-*
    checkin/       CHECKIN-I-*
    chat/          CHAT-I-*
    cleanup/       CLEANUP-I-*
    teammate/      TEAMMATE-I-*
    security/      SEC-I-*
```

Each test description must begin with its ID so CI summaries are traceable, e.g.:

```ts
it('AUTH-U-01 signUp rejects empty email', () => { … })
```
