'use client';

import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance, clerkPubKey } from "@/lib/clerk/clerk-config";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={clerkAppearance}
      publishableKey={clerkPubKey}
    >
      {children}
    </ClerkProvider>
  );
}