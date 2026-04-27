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

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  server?: string;
};

export function SignupForm() {
  const navigation = useNavigation<Navigation>();
  const { signupWithEmail } = useAuth();
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  function validate() {
    const nextErrors: FormErrors = {};
    if (!name.trim()) {
      nextErrors.name = 'Name is required.';
    }
    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
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
    setSuccessMessage('');

    try {
      await signupWithEmail({ name: name.trim(), email: email.trim(), password });
      setSuccessMessage('Account created. Please verify your email before logging in.');
      navigation.navigate('Login');
    } catch (error) {
      const message = error instanceof FirebaseError ? error.message : 'Unable to sign up. Please try again.';
      setErrors({ server: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput autoCapitalize="words" onChangeText={setName} placeholder="Full name" style={styles.input} value={name} />
      {errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}

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
      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

      <Pressable disabled={loading} onPress={handleSubmit} style={[styles.submitButton, loading && styles.disabled]}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Create Account</Text>}
      </Pressable>

      <GoogleSignInButton label="Sign up with Google" loading={googleLoading} onPress={signInWithGoogle} />

      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </Pressable>
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
  link: {
    marginTop: 8,
    color: '#2563eb',
    fontWeight: '600',
    textAlign: 'center',
  },
  error: {
    color: '#dc2626',
    fontSize: 12,
  },
  success: {
    color: '#059669',
    fontSize: 12,
  },
});
