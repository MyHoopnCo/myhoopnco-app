# MyHoop Beta 1 — Milestone test gates

Each milestone from the execution plan maps to a set of test IDs from TEST_SPEC.md.
A milestone is considered done when all tests in its gate column pass in CI.

| Milestone | Weeks | Deliverable | Test IDs that must be green |
|-----------|-------|-------------|----------------------------|
| Project setup & auth | 1–2 | Expo initialized, Firebase connected, signup/login working, 3-tab shell | `AUTH-U-01` through `AUTH-U-06`, `AUTH-I-01` through `AUTH-I-04` |
| Map screen | 3–4 | Map renders on user location, facility markers from Firestore, facility card with all fields | `MAP-U-01` through `MAP-U-05`, `MAP-I-01`, `MAP-I-02` |
| Facility features | 5–6 | Search bar, check-in (2h expiry), active user count, Get Directions CTA | `CHECKIN-U-01` through `CHECKIN-U-04`, `CHECKIN-I-01` through `CHECKIN-I-04`, `SEC-I-01` through `SEC-I-03` |
| Chat system | 7–8 | Facility group chat, Join Chat, chat list screen, 48h auto-delete | `CHAT-U-01` through `CHAT-U-05`, `CHAT-I-01` through `CHAT-I-04`, `CLEANUP-U-01` through `CLEANUP-U-03`, `CLEANUP-I-01`, `CLEANUP-I-02` |
| Profile & teammates | 9–10 | Profile screen, avatar upload, bio, teammate request/accept flow, full profile visibility | `PROFILE-U-01` through `PROFILE-U-04`, `PROFILE-I-01` through `PROFILE-I-03`, `TEAMMATE-U-01` through `TEAMMATE-U-05`, `TEAMMATE-I-01` through `TEAMMATE-I-03` |
| Polish & beta launch | 11–12 | Full suite green, security rules locked, TestFlight build to 25–50 YEG beta testers | All test IDs green, including `SEC-I-04`, `SEC-I-05`. EAS production build passing. |

---

## How to use this during sprints

At the start of each milestone, the team agrees which test IDs are in scope for that sprint.
Those tests should be written (or exist as stubs) before implementation begins — spec first,
then code.

EJ's bi-weekly architecture reviews should include a check of the CI test summary report
for the milestone's gated test IDs. Any failing ID in the gate column blocks the milestone
from being marked done, regardless of how the feature looks in the UI.

---

## Running only a milestone's tests locally

Use Jest's `--testNamePattern` flag with the ID prefix:

```bash
# Run all auth tests
npx jest --testNamePattern="AUTH-"

# Run all tests for the Week 5-6 milestone gate
npx jest --testNamePattern="CHECKIN-|SEC-I-0[123]"

# Run the full suite (what CI runs)
npm run test:unit && npm run test:integration
```
