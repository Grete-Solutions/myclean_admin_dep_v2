'use client';

import { store } from '@/utils/store';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';

interface ProviderProps {
  children: ReactNode;
}

export default function Providers({ children }: ProviderProps) {

  return (
    <SessionProvider>
<Provider store={store}>{children}</Provider>;    </SessionProvider>
  );
}

