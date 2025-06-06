'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-950 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/medimap-logo.svg" alt="MediMap Logo" width={32} height={32} />
            <span className="text-xl font-bold text-blue-600">MediMap</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 ml-8">
            <Link href="/" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/listing" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Listing
            </Link>
            <Link href="/agents" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Agents
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <SignedIn>
            <Link href="/account" className="text-sm font-medium hover:text-blue-600 transition-colors mr-4">
              Account
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-3">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">
                  Log In
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}