import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  reload,
  confirmPasswordReset,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth } from '../lib/firebase';
import { db } from '../lib/firebase';
import { UserProfile } from '../models/UserProfile';

type SignupInput = {
  name: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  signupWithEmail: (input: SignupInput) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  sendResetPasswordEmail: (email: string) => Promise<void>;
  resetPassword: (oobCode: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const APP_BASE_URL = process.env.EXPO_PUBLIC_APP_BASE_URL ?? 'http://localhost:8081';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const displayName = user.displayName ?? '';
    const email = user.email ?? '';
    const profile: UserProfile = {
      uid: user.uid,
      displayName,
      email,
      photoURL: user.photoURL ?? '',
      providers: user.providerData.map((provider) => provider.providerId),
    };

    void setDoc(
      doc(db, 'users', user.uid),
      {
        ...profile,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }, [user]);

  async function signupWithEmail({ name, email, password }: SignupInput) {
    const credentials = await createUserWithEmailAndPassword(auth, email, password);
    if (name.trim().length > 0) {
      await updateProfile(credentials.user, { displayName: name.trim() });
    }
    await sendEmailVerification(credentials.user);
    await signOut(auth);
  }

  async function loginWithEmail(email: string, password: string) {
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    await reload(credentials.user);
    if (!credentials.user.emailVerified) {
      await sendEmailVerification(credentials.user);
      await signOut(auth);
      throw new Error('Please verify your email before signing in. We sent a new verification email.');
    }
  }

  async function sendResetPasswordEmail(email: string) {
    await sendPasswordResetEmail(auth, email, {
      url: `${APP_BASE_URL}/reset-password`,
      handleCodeInApp: false,
    });
  }

  async function resetPassword(oobCode: string, newPassword: string) {
    await confirmPasswordReset(auth, oobCode, newPassword);
  }

  async function logout() {
    await signOut(auth);
  }

  async function refreshUser() {
    if (!auth.currentUser) {
      return;
    }
    await reload(auth.currentUser);
    setUser({ ...auth.currentUser });
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isEmailVerified: Boolean(user?.emailVerified) || user?.providerData.some((provider) => provider.providerId === 'google.com') === true,
      signupWithEmail,
      loginWithEmail,
      sendResetPasswordEmail,
      resetPassword,
      logout,
      refreshUser,
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
