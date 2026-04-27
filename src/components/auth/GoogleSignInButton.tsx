import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  label?: string;
  loading?: boolean;
  onPress: () => void;
};

export function GoogleSignInButton({ label = 'Continue with Google', loading = false, onPress }: Props) {
  return (
    <Pressable disabled={loading} onPress={onPress} style={[styles.button, loading && styles.disabled]}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <View style={styles.content}>
          <Text style={styles.logo}>G</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingVertical: 12,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#ea4335',
    color: '#fff',
    fontWeight: '700',
  },
  label: {
    fontWeight: '600',
    color: '#111827',
  },
});
