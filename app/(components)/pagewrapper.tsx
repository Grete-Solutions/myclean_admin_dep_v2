'use client'
import classNames from 'classnames';
import { ReactNode } from 'react';

export default function PageWrapper({ children }: { children: ReactNode }) {
    const bodyStyle = classNames("flex flex-col py-4 p-4 h-full w-full overflow-y-auto");

    return (
        <div className={bodyStyle}>
            {children}
        </div>
    );
}