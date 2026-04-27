import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '../../hooks/useAuth';

export function ForgotPasswordForm() {
  const { sendResetPasswordEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function validate() {
    if (!email.trim()) {
      setError('Email is required.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('Enter a valid email address.');
      return false;
    }
    setError('');
    return true;
  }

  async function handleSubmit() {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await sendResetPasswordEmail(email.trim());
      setSuccess('If the email exists, a reset link has been sent.');
    } catch (e) {
      const message = e instanceof FirebaseError ? e.message : 'Unable to send reset email.';
      setError(message);
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
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <Pressable disabled={loading} onPress={handleSubmit} style={[styles.submitButton, loading && styles.disabled]}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Send Reset Link</Text>}
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
  error: {
    color: '#dc2626',
    fontSize: 12,
  },
  success: {
    color: '#059669',
    fontSize: 12,
  },
});
