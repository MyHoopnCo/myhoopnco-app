import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';

export function LoginScreen() {
  return (
    <AuthLayout subtitle="Sign in to continue." title="Welcome back">
      <LoginForm />
    </AuthLayout>
  );
}
