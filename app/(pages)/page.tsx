'use client';

import { selectIdToken } from '@/utils/tokenSlice';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import Cookies from 'js-cookie'; // You'll need to install this package

export default function TokenDisplayComponent() {
  // Get the token from Redux store
  const idToken = useSelector(selectIdToken);

  // Save token to cookie whenever it changes
  useEffect(() => {
    if (idToken) {
      // Set the cookie with an appropriate expiration time
      // httpOnly: true would be more secure but can only be set from server
      Cookies.set('idToken', idToken, { 
        expires: 7, // expires in 7 days
        path: '/',
        sameSite: 'strict'
      });
    } else {
      // Remove the cookie if token is not available
      Cookies.remove('idToken');
    }
  }, [idToken]);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-bold mb-4">Token Information</h1>
      
      {idToken ? (
        <div>
          <p className="text-green-600 mb-2">Token is available!</p>
          <div className="bg-gray-100 p-3 rounded overflow-auto">
            <code className="text-sm break-all">{idToken}</code>
          </div>
        </div>
      ) : (
        <p className="text-red-600">No token available. Please log in first.</p>
      )}
    </div>
  );
}