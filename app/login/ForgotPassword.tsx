'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { LoginLogo } from './LoginLogo';
import { toast } from "sonner";

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      const response = await fetch('https://myclean-backend-v2-775492522781.europe-west1.run.app/admin/auth/forgot-password', {
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
  }

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
              <Link href="/login" className="font-semibold text-[#08898D] hover:text-[#08898d9e] text-sm">
                Back to sign in
              </Link>
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
          <form className="space-y-6" onSubmit={handleSubmit}>
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
            <Link href="/login" className="font-semibold text-[#08898D] hover:text-[#08898d9e] text-sm">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;