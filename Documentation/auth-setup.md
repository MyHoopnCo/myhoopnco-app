# Auth Setup Notes

- Enable **Email/Password** and **Google** providers in Firebase Authentication.
- In Firebase Authentication settings, add your app domains to **Authorized domains** (for web OAuth redirects).
- Ensure your password reset URL points to `EXPO_PUBLIC_APP_BASE_URL/reset-password` so the app can read the `oobCode`.
- For Google sign-in, create client IDs for each platform and copy them into `.env`.
- Firestore user profiles are written to `users/{uid}` after sign-in/sign-up; update `firestore.rules` if your current rules do not allow this write pattern.
