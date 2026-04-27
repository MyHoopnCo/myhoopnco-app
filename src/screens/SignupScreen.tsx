import { AuthLayout } from '../components/auth/AuthLayout';
import { SignupForm } from '../components/auth/SignupForm';

export function SignupScreen() {
  return (
    <AuthLayout subtitle="Create an account to get started." title="Create account">
      <SignupForm />
    </AuthLayout>
  );
}
