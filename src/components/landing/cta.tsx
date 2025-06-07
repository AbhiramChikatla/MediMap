'use client';

import { Button } from '@/components/ui/button';
import { SignUpButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  const { isSignedIn } = useUser();
  
  return (
    <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Medimap your workflow?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of teams who have already transformed their productivity with Medimap. Start your free
              trial today and see the difference in just 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" className="px-8">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <Button size="lg" className="px-8">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignUpButton>
              )}
              <Button size="lg" variant="outline" className="px-8">
                Schedule Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">No credit card required • 14-day free trial • Cancel anytime</p>
          </div>
        </div>
      </section>
  );
}