import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import AuthLayout from '@/components/auth/AuthLayout';

export const metadata: Metadata = {
  title: 'Login | FlowForge ERP',
  description: 'Log in to FlowForge Enterprise Resource Planning System',
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-brand-primary mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-text-secondary text-sm">Enter your credentials to access the ERP</p>
      </div>
      <LoginForm />
    </AuthLayout>
  );
}
