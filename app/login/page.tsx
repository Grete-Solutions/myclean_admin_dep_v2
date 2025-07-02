'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { LoginLogo } from './LoginLogo';
import { toast } from "sonner";
import { Eye, EyeOff } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'forgot-password' | 'reset-password'>('login');
  const [emailSent, setEmailSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const router = useRouter();

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    
    setLoading(true);

    try {
      // Store credentials temporarily in sessionStorage
      // This is more secure than localStorage but still cleared when browser is closed
      sessionStorage.setItem('pendingLoginEmail', email);
      sessionStorage.setItem('pendingLoginPassword', password);
      
      // Initiate OTP request
      const response = await fetch('/api/POST/postLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to send OTP');
      }
      
      toast.success('OTP sent to your email');
      router.push(`/login/otp?email=${encodeURIComponent(email)}`);
      
    } catch (error) {
      console.error('Error during login attempt:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to initiate login.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }
      
      setEmailSent(true);
      toast.success('Password reset instructions sent to your email');
      
    } catch (error) {
      console.error('Error during forgot password:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to send reset email.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

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

  const handleResetPasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
    
    if (!resetToken) {
      toast.error('Invalid reset token. Please request a new password reset.');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: resetToken,
          newPassword,
          confirmPassword 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      
      toast.success('Password reset successfully! Please sign in with your new password.');
      setCurrentView('login');
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');
      
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
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setResetToken('');
    setEmailSent(false);
    setLoading(false);
  };

  // Login View
  if (currentView === 'login') {
    return (
      <>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <LoginLogo />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
              Sign in to your account
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6">
                  Email
                </label>
                <div className="mt-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium leading-6">
                    Password
                  </label>
                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setCurrentView('forgot-password');
                      }}
                      className="font-semibold text-[#08898D] hover:text-[#08898d9e]"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
                <div className="mt-2 relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pr-10 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
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
                  {loading ? 'Sending OTP...' : 'Sign in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }

  // Forgot Password View
  if (currentView === 'forgot-password') {
    if (emailSent) {
      return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <LoginLogo />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
              Check your email
            </h2>
            <p className="mt-4 text-center text-sm text-gray-600">
              We&apos;ve sent password reset instructions to <strong>{email}</strong>
            </p>
            <p className="mt-2 text-center text-sm text-gray-600">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <div className="space-y-4">
              <button
                onClick={() => setEmailSent(false)}
                className="flex w-full justify-center rounded-md bg-[#08898D] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#08898dab] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Try again
              </button>
              <div className="text-center">
                <button
                  onClick={() => {
                    resetForm();
                    setCurrentView('login');
                  }}
                  className="font-semibold text-[#08898D] hover:text-[#08898d9e] text-sm"
                >
                  Back to sign in
                </button>
              </div>
              <div className="text-center">
                <button
                  onClick={() => {
                    resetForm();
                    setCurrentView('reset-password');
                  }}
                  className="font-semibold text-gray-600 hover:text-gray-800 text-sm"
                >
                  Have a reset token? Reset password
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <LoginLogo />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
              Forgot your password?
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email address and we&apos;ll send you instructions to reset your password.
            </p>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleForgotPasswordSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6">
                  Email address
                </label>
                <div className="mt-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your email"
                  />
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
                  {loading ? 'Sending...' : 'Send reset instructions'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  resetForm();
                  setCurrentView('login');
                }}
                className="font-semibold text-[#08898D] hover:text-[#08898d9e] text-sm"
              >
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Reset Password View
  if (currentView === 'reset-password') {
    return (
      <>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <LoginLogo />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">
              Reset your password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your reset token and new password below
            </p>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleResetPasswordSubmit}>
              <div>
                <label htmlFor="resetToken" className="block text-sm font-medium leading-6">
                  Reset Token
                </label>
                <div className="mt-2">
                  <Input
                    id="resetToken"
                    name="resetToken"
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter reset token from email"
                  />
                </div>
              </div>

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
              <button
                onClick={() => {
                  resetForm();
                  setCurrentView('login');
                }}
                className="font-semibold text-[#08898D] hover:text-[#08898d9e] text-sm"
              >
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}

export default Login;