'use client';

import { store } from '@/utils/store';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import SessionWatcher from './SessionWatcher';

interface ProviderProps {
  children: ReactNode;
}

export default function Providers({ children }: ProviderProps) {
  return (
    <SessionProvider refetchInterval={60}>
      <Provider store={store}>
        <SessionWatcher />
        {children}
      </Provider>
    </SessionProvider>
  );
}

