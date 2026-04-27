import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '../../hooks/useAuth';
import { RootStackParamList } from '../../types/navigation';
import { GoogleSignInButton } from './GoogleSignInButton';
import { useGoogleAuth } from '../../auth/useGoogleAuth';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function LoginForm() {
  const navigation = useNavigation<Navigation>();
  const { loginWithEmail } = useAuth();
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; server?: string }>({});

  function validate() {
    const nextErrors: typeof errors = {};
    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      nextErrors.password = 'Password is required.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await loginWithEmail(email.trim(), password);
    } catch (error) {
      const message = error instanceof FirebaseError ? error.message : 'Unable to sign in. Please try again.';
      setErrors({ server: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        value={email}
      />
      {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

      <TextInput
        autoCapitalize="none"
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
      />
      {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}
      {errors.server ? <Text style={styles.error}>{errors.server}</Text> : null}

      <Pressable disabled={loading} onPress={handleSubmit} style={[styles.submitButton, loading && styles.disabled]}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Sign In</Text>}
      </Pressable>

      <GoogleSignInButton loading={googleLoading} onPress={signInWithGoogle} />

      <View style={styles.row}>
        <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.link}>Create account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: '#111827',
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.7,
  },
  row: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
  },
  error: {
    color: '#dc2626',
    fontSize: 12,
  },
});
