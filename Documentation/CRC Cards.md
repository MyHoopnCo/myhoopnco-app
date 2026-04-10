# MyHoop Beta 1 — CRC Cards

CRC (Class–Responsibility–Collaborator) cards derived from the **MyHoop Beta 1 Product & Technical Specification** (April 2026). Collaborators are other concepts or services this class depends on or coordinates with.

---

## User (`users/{uid}`)

| | |
| --- | --- |
| **Responsibilities** | Represent an authenticated player: unique **username**, **avatar**, **bio**, list of **joined facilities**, **teammates** and **pending teammate requests**, optional **check-in** at a facility with **expiry**, account **metadata** (`createdAt`). Enforce teammate model: mutual connection only; control visibility of full profile vs limited view. |
| **Collaborators** | **Firebase Auth** (identity), **Facility** (joined list, check-in target), **User** (teammate peers), **Firebase Storage** (avatar URL), **Firestore** (persistence), **Security Rules** (self-profile writes). |

---

## Facility (`facilities/{facilityId}`)

| | |
| --- | --- |
| **Responsibilities** | Represent a basketball location: **name**, **type** (rec center, school gym, private gym, outdoor court), **address**, **coordinates**, **open gym hours** (manual), **hours last updated**, **active user count** (derived from check-ins). Serve as the anchor for map markers, facility card content, and one group chat per facility. |
| **Collaborators** | **User** (check-ins, joined lists), **FacilityChat** / **Message** (chat scoped by facility), **Map UI** (markers, search), **Admin curation** (hours writes), **Firestore** (read for users; admin write). |

---

## CheckIn (concept; fields on User + Facility)

| | |
| --- | --- |
| **Responsibilities** | Record that a user is **active at a facility** for a **fixed window** (2 hours or until checkout). Update **checkedInAt**, **checkInExpiry** on the user and contribute to **activeUsers** on the facility. No live GPS streaming. |
| **Collaborators** | **User**, **Facility**, **Firestore** (atomic or transactional updates as designed), **Facility card** (Check In CTA). |

---

## FacilityChat (per-facility conversation)

| | |
| --- | --- |
| **Responsibilities** | Provide **one group chat per facility**. Users **join** via facility card; membership ties to **joinedFacilities** (and chat list UI). **Text only** in Beta 1; **usernames only** in UI. |
| **Collaborators** | **Facility**, **User**, **Message**, **Firebase Realtime Database** (`chats/{facilityId}/messages/...`), **Security Rules** (read/write for joined users). |

---

## Message (`chats/{facilityId}/messages/{messageId}`)

| | |
| --- | --- |
| **Responsibilities** | Carry **text**, **sender UID**, **sender username**, **timestamp**. Support **auto-delete** after 48 hours (no long-term retention). Visible to facility chat members. |
| **Collaborators** | **FacilityChat**, **User**, **Realtime Database**, **MessageCleanupFunction** (scheduled purge), **Moderation** (manual delete). |

---

## TeammateRequest (concept; `pendingRequests` / `teammates` on User)

| | |
| --- | --- |
| **Responsibilities** | **Request**: User A asks User B to be teammates. **Accept/decline**: User B responds. On accept, both appear in each other’s **teammates**; they gain **full profile** and **facility activity** visibility (vs limited chat tap-through view). |
| **Collaborators** | **User** (×2), **Profile UI**, **Firestore**. |

---

## MapScreen (home / center tab)

| | |
| --- | --- |
| **Responsibilities** | **GPS-centered** map (Snap Map–style), **pan/zoom**, **facility markers** (blue directional arrows), **search** by name, navigate to facility on marker tap or search selection, open **Facility card** sheet. Request **location permission**; degrade to manual search if denied. |
| **Collaborators** | **Facility**, **react-native-maps**, **Expo Location**, **Firestore** (facility reads), **FacilityCard**, **Navigation**. |

---

## FacilityCard (bottom sheet UI)

| | |
| --- | --- |
| **Responsibilities** | Display facility **name**, **type**, **address**, **hours**, **last updated**, **active user count**, **Get Directions** (opens Apple/Google Maps), **Join Chat**, **Check In**. |
| **Collaborators** | **Facility**, **User** (check-in), **FacilityChat**, **Linking** / maps URL, **Navigation** (to chat). |

---

## ChatsScreen (left tab)

| | |
| --- | --- |
| **Responsibilities** | List **facility chats the user has joined**; tap opens conversation. Reflect **text-only** thread with **48-hour** visible history behavior. |
| **Collaborators** | **User** (`joinedFacilities`), **Facility**, **FacilityChat**, **Message**, **Realtime Database**, **Chat thread UI**. |

---

## ProfileScreen (right tab; TikTok-style layout)

| | |
| --- | --- |
| **Responsibilities** | Show **username**, **avatar**, **bio**, **facilities list**, **settings** (location sharing toggle, log out, edit profile). Support **teammate** flows from spec (requests, accept/decline, view teammate profiles). |
| **Collaborators** | **User**, **Firebase Auth**, **Firebase Storage**, **Facility**, **TeammateRequest**, **Settings** subflows. |

---

## AuthService (Firebase Auth)

| | |
| --- | --- |
| **Responsibilities** | **Signup** (email and/or Google/Apple), **login**, **password reset**. Establish session for all Firebase SDK calls. **Username** chosen at signup and stored on **User** document. |
| **Collaborators** | **User** (profile doc creation/update), **Firebase Auth**, **Firestore**. |

---

## MessageCleanupFunction (Cloud Function, scheduled)

| | |
| --- | --- |
| **Responsibilities** | **Delete messages older than 48 hours** from Realtime Database. Sole **server-side** business logic in Beta 1 besides hosting. |
| **Collaborators** | **Message**, **Firebase Realtime Database**, **Cloud Scheduler** (or Firebase scheduled functions). |

---

## SecurityRules (Firestore + Realtime DB)

| | |
| --- | --- |
| **Responsibilities** | **Authorize** reads/writes: users **only write own profile**; **facility** data **read-only** for clients (**admin** writes); **chat** messages writable by **authenticated** users with membership rules; align with “no custom backend” client-direct access. |
| **Collaborators** | **User**, **Facility**, **Message**, **Firebase Auth** (request.auth). |

---

## Moderator (core team; manual)

| | |
| --- | --- |
| **Responsibilities** | **Delete messages**, **ban users**; handle **reporting** outside automated scope in Beta 1. Not automated moderation. |
| **Collaborators** | **Message**, **User**, **Admin tools** / console (implementation-specific). |

---

## AppShell (navigation)

| | |
| --- | --- |
| **Responsibilities** | Provide **three tabs**: **Map** (home), **Chats**, **Profile**; swipe or tap navigation. Host auth-gated content and post-login flows (e.g. location permission after signup). |
| **Collaborators** | **MapScreen**, **ChatsScreen**, **ProfileScreen**, **AuthService**. |

---

### Notes

- **Out of scope for Beta 1** (no CRC detail): DMs, media in chat, E2E encryption, push notifications, public/private profile toggle, automated filters, live user avatars on map, facility reviews, ticketing/leagues.
- **Stack reference** (from spec): React Native + Expo; Firestore for users/facilities; Realtime Database for chat messages; Firebase Storage for avatars; Cloud Functions for message cleanup.
