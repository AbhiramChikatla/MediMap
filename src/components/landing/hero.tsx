'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { SignUpButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import AnimatedTooltipPreview from '@/components/ui/animated-tooltip-demo';

export function Hero() {
  const { isSignedIn } = useUser();

  return (
    <div className="relative overflow-hidden bg-white dark:bg-black "> {/* Added pt-16 for navbar spacing */}
      {/* Hero Content */}
      <div className="container mx-auto px-4 py-20 flex flex-col lg:flex-row items-center gap-12">
        <motion.div 
          className="flex-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col gap-6 max-w-[640px] mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tighter text-black dark:text-white">
              Find the Best <span className="text-black dark:text-white border-b-2 border-black dark:border-white">Healthcare Centers</span> Near You
            </h1>
          
            <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 mb-8 max-w-2xl mx-auto">
              Discover and compare healthcare centers based on wait times, services, and patient reviews. Make informed decisions about your healthcare journey.
            </p>
          
            <div className="flex flex-wrap gap-4 justify-center">
              {!isSignedIn ? (
                <SignUpButton mode="modal">
                  <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 border-0">
                    Get Started
                  </Button>
                </SignUpButton>
              ) : (
                <>
                  <Link href="/?proceed=true">
                    <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 border-0">
                      Go to Main App
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" size="lg" className="rounded-full px-8">
                      Skip Landing
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/#how-it-works">
                <Button variant="outline" size="lg" className="rounded-full px-8">
                  How It Works
                </Button>
              </Link>
            </div>
          
            <div className="mt-12 flex items-center gap-6 justify-center">
              {/* Replace the static avatars with AnimatedTooltipPreview */}
              <AnimatedTooltipPreview />
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex-1 relative h-[500px] w-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl backdrop-blur-sm border border-white/20 shadow-xl overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
            
            {/* This would be replaced with the actual 3D model or animation */}
            <div className="h-full w-full flex items-center justify-center">
              <Image 
                src="/medimap-logo.svg" 
                alt="MediMap 3D Demo" 
                width={300} 
                height={300}
                className="animate-float"
              />
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Floating Elements - Decorative */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl animate-float-delay" />
    </div>
  );
}
