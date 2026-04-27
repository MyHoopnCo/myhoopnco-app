import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FirebaseError } from 'firebase/app';
import * as Linking from 'expo-linking';
import { useAuth } from '../../hooks/useAuth';

export function ResetPasswordForm() {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const url = Linking.useURL();

  const oobCode = useMemo(() => {
    const parsed = Linking.parse(url ?? '');
    const maybeCode = parsed.queryParams?.oobCode;
    return typeof maybeCode === 'string' ? maybeCode : '';
  }, [url]);

  function validate() {
    if (!oobCode) {
      setError('Missing or invalid reset token in this link.');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
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
      await resetPassword(oobCode, password);
      setSuccess('Password reset successful. You can now sign in.');
    } catch (e) {
      const message = e instanceof FirebaseError ? e.message : 'Unable to reset password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        autoCapitalize="none"
        onChangeText={setPassword}
        placeholder="New password"
        secureTextEntry
        style={styles.input}
        value={password}
      />
      <TextInput
        autoCapitalize="none"
        onChangeText={setConfirmPassword}
        placeholder="Confirm new password"
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <Pressable disabled={loading} onPress={handleSubmit} style={[styles.submitButton, loading && styles.disabled]}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Reset Password</Text>}
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
