import { AuthLayout } from '../components/auth/AuthLayout';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';

export function ForgotPasswordScreen() {
  return (
    <AuthLayout subtitle="Enter your email and we will send a reset link." title="Forgot password">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
