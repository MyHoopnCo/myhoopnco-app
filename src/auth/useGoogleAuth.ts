import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    async function completeGoogleLogin() {
      if (!response) {
        return;
      }

      if (response.type !== 'success') {
        setLoading(false);
        return;
      }

      const idToken = response.authentication?.idToken;
      if (!idToken) {
        throw new Error('Google sign-in failed. No ID token received.');
      }

      setLoading(true);
      try {
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      } finally {
        setLoading(false);
      }
    }

    completeGoogleLogin().catch(() => {
      setLoading(false);
    });
  }, [response]);

  async function signInWithGoogle() {
    setLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }

  return {
    request,
    loading,
    signInWithGoogle,
  };
}
