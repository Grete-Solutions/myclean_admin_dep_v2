'use client';
import { Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { toast } from "sonner";
import { useDispatch } from 'react-redux';
import { setToken, setRefreshToken } from '@/utils/tokenSlice'; // Updated import
import { signIn } from 'next-auth/react';

const OtpPage = () => {
  const [email, setEmail] = useState('');
  const [Otp, setOtp] = useState(new Array(6).fill(''));
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const param = useSearchParams();
  const emailFromParams = param.get('email');
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailFromParams) {
      setEmail(emailFromParams);
    }
  }, [emailFromParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
  
    try {
      // First, verify the OTP is correct
      const otpResponse = await fetch('/api/POST/postVerifyOtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: Otp.join('') }),
      });
  
      const otpData = await otpResponse.json();
  
      if (!otpResponse.ok) {
        throw new Error(otpData.error || otpData.message || 'Invalid OTP code');
      }
      
      // Retrieve credentials from sessionStorage
      const password = sessionStorage.getItem('pendingLoginPassword');
      
      if (!password) {
        throw new Error('Login session expired. Please try again.');
      }
      
      // Get the idToken and refreshToken from the OTP verification response
      const idToken = otpData.idToken;
      const refreshToken = otpData.refreshToken;
      
      if (!idToken || !refreshToken) {
        throw new Error('Authentication tokens not received');
      }
      
      // Store tokens in Redux
      dispatch(setToken(idToken));
      dispatch(setRefreshToken(refreshToken));
      
      // Store tokens in localStorage
      localStorage.setItem('authToken', idToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Now we call NextAuth signIn with all required credentials including the tokens
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        otp: Otp.join(''),
        idToken, // Pass the idToken to NextAuth
        refreshToken, // Pass the refreshToken to NextAuth
      });

      console.log('Items',  
        email,
        password,
        idToken,
        refreshToken
      )
      
      if (result?.error) {
        throw new Error(result.error || 'Authentication failed');
      }
      
      if (result?.ok) {
        // Clean up session storage
        sessionStorage.removeItem('pendingLoginEmail');
        sessionStorage.removeItem('pendingLoginPassword');
        
        toast.success('Login successful!');
        
        // Redirect to the main page
        setTimeout(() => {
          router.push('/');
        }, 500);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Verification failed. Please try again.');
      } else {
        toast.error('Verification failed. Please try again.');
      }
      
      // Redirect back to login on error
      // setTimeout(() => {
      //   router.push('/login');
      // }, 1500);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = useCallback(
    (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      if (/^\d*$/.test(value)) {
        const newOtp = [...Otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value.length === 1 && index < 5) {
          inputRefs.current[index + 1].focus();
        }

        if (newOtp.every((digit) => digit !== '')) {
          setTimeout(() => {
            document.getElementById('otp-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }, 100);
        }
      }
    },
    [Otp]
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      const pasteData = event.clipboardData.getData('text');
      if (/^\d{6}$/.test(pasteData)) {
        const newOtp = pasteData.split('');
        setOtp(newOtp);
        newOtp.forEach((digit, index) => {
          if (inputRefs.current[index]) {
            inputRefs.current[index].value = digit;
          }
        });
        setTimeout(() => {
          document.getElementById('otp-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }, 100);
      }
    },
    []
  );

  const handleKeyDown = useCallback(
    (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Backspace' && Otp[index] === '') {
        if (index > 0) {
          inputRefs.current[index - 1].focus();
        }
      }
    },
    [Otp]
  );

  const handleResendCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email is required');
      return;
    }
    
    try {
      const response = await fetch('/api/POST/sendOtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to resend OTP');
      }
      
      toast.success('New OTP sent to your email');
      // Clear current OTP fields
      setOtp(new Array(6).fill(''));
      
    } catch (error) {
      console.error('Error resending OTP:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to resend OTP');
      } else {
        toast.error('Failed to resend OTP');
      }
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-12">
      <div className="relative bg-white px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
        <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="font-semibold text-3xl">
              <p>Email Verification</p>
            </div>
            <div className="flex flex-row text-sm font-medium text-gray-400">
              <p>We have sent a code to your email {email}</p>
            </div>
          </div>

          <div>
            <form id="otp-form" onSubmit={handleSubmit}>
              <div className="flex flex-col space-y-16">
                <Input value={email} className="hidden" type="text" readOnly />
                <div className="flex flex-row items-center justify-between mx-auto space-x-3 w-full">
                  {[0, 1, 2, 3, 4, 5].map((_, index) => (
                    <div key={index} className="w-full h-16">
                      <input
                        ref={(el) => {
                          if (el) {
                            inputRefs.current[index] = el;
                          }
                        }}
                        className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-[#0A8791]"
                        type="text"
                        maxLength={1}
                        value={Otp[index]}
                        onChange={(event) => handleInputChange(index, event)}
                        onKeyDown={(event) => handleKeyDown(index, event)}
                        onPaste={handlePaste}
                        disabled={loading}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col space-y-5">
                  <div>
                    <button
                      type="submit"
                      className={`flex flex-row items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-[#0A8791] border-none text-white text-sm shadow-sm ${
                        loading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : 'Verify Account'}
                    </button>
                  </div>

                  <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                    <p>Didn&apos;t receive code?</p>
                    <a
                      className="flex flex-row items-center text-[#0A8791]"
                      href="#"
                      onClick={handleResendCode}
                    >
                      Resend
                    </a>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <OtpPage />
  </Suspense>
);

export default Page;