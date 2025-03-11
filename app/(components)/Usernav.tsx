'use client'
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function UserNav() {
    const { data: session, status } = useSession();
    
    console.log('Session Status:', status);
    console.log('Session Data:', session);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarImage src="/avatars/02.png" alt="User avatar" />
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-[99998]">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {session?.user?.displayName || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {session?.user?.email || 'No email available'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">
                            Role: {session?.user?.role || 'Not available'}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <Link href='/profile' className="w-full">
                            Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href='/settings' className="w-full">
                            Settings
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <button 
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full text-left"
                    >
                        Log out
                    </button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}