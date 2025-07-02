'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { LoginLogo } from './LoginLogo';
import { toast } from "sonner";
import { Eye, EyeOff } from 'lucide-react';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get token from URL parameters
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast.error('Invalid reset link. Please request a new password reset.');
      router.push('/forgot-password');
    }
  }, [searchParams, router]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return errors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    
    // Validate password strength
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      toast.error(`Password requirements not met: ${passwordErrors[0]}`);
      return;
    }
    
    if (!token) {
      toast.error('Invalid reset token. Please request a new password reset.');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('https://myclean-backend-v2-775492522781.europe-west1.run.app/admin/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          newPassword,
          confirmPassword 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
      toast.success('Password reset successfully! Please sign in with your new password.');
      router.push('/login');
      
    } catch (error) {
      console.error('Error during password reset:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to reset password.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <LoginLogo />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium leading-6">
                New Password
              </label>
              <div className="mt-2 relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={toggleNewPasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6">
                Confirm Password
              </label>
              <div className="mt-2 relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#08898D] hover:bg-[#08898dab]'
                }`}
                disabled={loading} 
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="font-semibold text-[#08898D] hover:text-[#08898d9e] text-sm">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;