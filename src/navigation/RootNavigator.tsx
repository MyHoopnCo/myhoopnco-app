import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { useAuth } from '../hooks/useAuth';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { loading, isAuthenticated, isEmailVerified } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const allowProtected = isAuthenticated && isEmailVerified;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {allowProtected ? (
        <Stack.Screen component={DashboardScreen} name="Dashboard" />
      ) : (
        <>
          <Stack.Screen component={LoginScreen} name="Login" />
          <Stack.Screen component={SignupScreen} name="Signup" />
          <Stack.Screen component={ForgotPasswordScreen} name="ForgotPassword" />
          <Stack.Screen component={ResetPasswordScreen} name="ResetPassword" />
        </>
      )}
    </Stack.Navigator>
  );
}
