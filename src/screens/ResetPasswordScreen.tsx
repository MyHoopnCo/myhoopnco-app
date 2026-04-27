import { AuthLayout } from '../components/auth/AuthLayout';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';

export function ResetPasswordScreen() {
  return (
    <AuthLayout subtitle="Choose a new password for your account." title="Reset password">
      <ResetPasswordForm />
    </AuthLayout>
  );
}
